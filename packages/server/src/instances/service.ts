import { Message, uuid } from '@botpress/messaging-base'
import { Endpoint } from '@botpress/messaging-channels'
import {
  CachingService,
  DispatchService,
  DistributedService,
  Logger,
  LoggerService,
  ServerCache,
  Service
} from '@botpress/messaging-engine'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConversationService } from '../conversations/service'
import { MappingService } from '../mapping/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { ProviderService } from '../providers/service'
import { StatusService } from '../status/service'
import { InstanceDispatcher, InstanceDispatches } from './dispatch'
import { InstanceEmitter, InstanceEvents, InstanceWatcher } from './events'
import { InstanceInvalidator } from './invalidator'
import { InstanceMonitoring } from './monitoring'
import { LinkedQueue } from './queue'
import { InstanceSandbox } from './sandbox'

export class InstanceService extends Service {
  get events(): InstanceWatcher {
    return this.emitter
  }

  public readonly sandbox: InstanceSandbox
  private emitter: InstanceEmitter
  private invalidator: InstanceInvalidator
  private monitoring: InstanceMonitoring
  private messageQueueCache!: ServerCache<uuid, LinkedQueue<QueuedMessage>>
  private logger: Logger
  private dispatcher!: InstanceDispatcher

  constructor(
    private loggerService: LoggerService,
    private distributedService: DistributedService,
    private dispatchService: DispatchService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private clientService: ClientService,
    private mappingService: MappingService,
    private statusService: StatusService
  ) {
    super()
    this.emitter = new InstanceEmitter()
    this.invalidator = new InstanceInvalidator(
      this.channelService,
      this.providerService,
      this.conduitService,
      this.clientService,
      this.statusService,
      this
    )
    this.logger = this.loggerService.root.sub('instances')
    this.monitoring = new InstanceMonitoring(
      this.logger.sub('monitoring'),
      this.distributedService,
      this.channelService,
      this.conduitService,
      this.statusService,
      this
    )
    this.sandbox = new InstanceSandbox(this.clientService, this.mappingService, this)
  }

  async setup() {
    this.messageQueueCache = await this.cachingService.newServerCache('cache_thread_queues_cache')
    await this.invalidator.setup()
    this.messageService.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))

    this.dispatcher = await this.dispatchService.create('dispatch_converse', InstanceDispatcher)
    this.dispatcher.on(InstanceDispatches.Stop, this.handleDispatchStop.bind(this))

    for (const channel of this.channelService.list()) {
      channel.autoStart(async (providerName) => {
        const provider = await this.providerService.getByName(providerName)
        const conduit = await this.conduitService.getByProviderAndChannel(provider.id, channel.meta.id)
        return conduit!.config
      })
    }
  }

  async destroy() {
    await this.monitoring.destroy()

    for (const channel of this.channelService.list()) {
      for (const scope of channel.scopes) {
        const provider = await this.providerService.getByName(scope)
        const conduit = await this.conduitService.getByProviderAndChannel(provider.id, channel.meta.id)

        await this.stop(conduit!.id)
      }
    }
  }

  async monitor() {
    await this.monitoring.monitor()
  }

  async initialize(conduitId: uuid) {
    await this.start(conduitId)

    const conduit = (await this.conduitService.get(conduitId))!
    const provider = await this.providerService.getById(conduit.providerId)
    const channel = this.channelService.getById(conduit.channelId)

    try {
      await this.distributedService.using(`lock_dyn_instance_init::${conduitId}`, async () => {
        await channel.initialize(provider.name)
      })
    } catch (e) {
      await this.statusService.addError(conduitId, e as Error)
      this.logger.error(e, 'Error trying to initialize conduit', provider.name)
      return this.emitter.emit(InstanceEvents.InitializationFailed, conduitId)
    }

    await this.statusService.updateInitializedOn(conduitId, new Date())
    await this.statusService.clearErrors(conduitId)
    return this.emitter.emit(InstanceEvents.Initialized, conduitId)
  }

  async start(conduitId: uuid) {
    const conduit = (await this.conduitService.get(conduitId))!
    const provider = await this.providerService.getById(conduit.providerId)
    const channel = this.channelService.getById(conduit.channelId)

    if (channel.has(provider.name)) {
      return
    }

    try {
      await this.distributedService.using(`lock_dyn_instance_setup::${conduitId}`, async () => {
        await channel.start(provider.name, conduit.config)
        await this.dispatcher.subscribe(conduitId)
      })
      await this.emitter.emit(InstanceEvents.Setup, conduitId)
    } catch (e) {
      await this.statusService.addError(conduitId, e as Error)
      this.logger.error(e, 'Error trying to setup conduit', provider.name)
      await this.emitter.emit(InstanceEvents.SetupFailed, conduitId)
    }
  }

  async stop(conduitId: uuid) {
    await this.dispatcher.publish(InstanceDispatches.Stop, conduitId, {})
  }

  async sendToEndpoint(conduitId: uuid, endpoint: Endpoint, content: any) {
    const conduit = (await this.conduitService.get(conduitId))!
    const provider = await this.providerService.getById(conduit.providerId)
    const channel = this.channelService.getById(conduit.channelId)

    await channel.send(provider.name, endpoint, content)
  }

  private async handleDispatchStop(conduitId: uuid) {
    const conduit = (await this.conduitService.get(conduitId))!
    const provider = await this.providerService.getById(conduit.providerId)
    const channel = this.channelService.getById(conduit.channelId)

    if (!channel.has(provider.name)) {
      return
    }

    try {
      await channel.stop(provider.name)
      await this.emitter.emit(InstanceEvents.Destroyed, conduitId)
    } catch (e) {
      this.logger.error(e, 'Error trying to destroy conduit')
    } finally {
      await this.dispatcher.unsubscribe(conduitId)
    }
  }

  private async handleMessageCreated({ message, source }: MessageCreatedEvent) {
    const conversation = await this.conversationService.get(message.conversationId)
    const client = await this.clientService.getById(conversation!.clientId)
    const convmaps = await this.mappingService.convmap.listByConversationId(message.conversationId)

    // small optimization. If the message comes from a channel, and we are only linked to one channel,
    // then we already know that we don't need to spread the message to other connected channels
    if (convmaps.length === 1 && source?.endpoint) {
      return
    }

    for (const { threadId, tunnelId } of convmaps) {
      const endpoint = await this.mappingService.getEndpoint(threadId)
      const tunnel = await this.mappingService.tunnels.get(tunnelId)

      if (!source?.endpoint || !this.endpointEqual(source.endpoint, endpoint)) {
        const conduit = await this.conduitService.getByProviderAndChannel(client!.providerId, tunnel!.channelId)
        if (!conduit) {
          return
        }

        const queue = this.getMessageQueue(threadId)

        const isEmpty = queue.empty()
        queue.enqueue({ conduitId: conduit.id, message, endpoint })

        if (isEmpty) {
          void this.runMessageQueue(queue)
        }
      }
    }
  }

  private getMessageQueue(threadId: uuid) {
    const cached = this.messageQueueCache.get(threadId)
    if (cached) {
      return cached
    }

    const queue = new LinkedQueue<QueuedMessage>()
    this.messageQueueCache.set(threadId, queue)

    return queue
  }

  private async runMessageQueue(queue: LinkedQueue<QueuedMessage>) {
    try {
      while (!queue.empty()) {
        const item = queue.peek()

        try {
          await this.sendToEndpoint(item.conduitId, item.endpoint, item.message.payload)
        } catch (e) {
          this.logger.error(e, 'Failed to send message to instance')
        }

        queue.dequeue()
      }
    } catch (e) {
      this.logger.error(e, 'Failed to run message queue')
    }
  }

  private endpointEqual(a: Endpoint, b: Endpoint) {
    return a.identity !== b.identity || a.sender !== b.sender || a.thread !== b.thread
  }
}

interface QueuedMessage {
  conduitId: uuid
  message: Message
  endpoint: Endpoint
}
