import { Message, uuid } from '@botpress/messaging-base'
import ms from 'ms'
import yn from 'yn'
import { App } from '../app'
import { Service } from '../base/service'
import { ActionSource } from '../base/source'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConduitService } from '../conduits/service'
import { ConversationService } from '../conversations/service'
import { DistributedService } from '../distributed/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'
import { Convmap } from '../mapping/convmap/types'
import { MappingService } from '../mapping/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { ProviderService } from '../providers/service'
import { StatusService } from '../status/service'
import { InstanceEmitter, InstanceEvents, InstanceWatcher } from './events'
import { InstanceInvalidator } from './invalidator'
import { InstanceMonitoring } from './monitoring'
import { InstanceSandbox } from './sandbox'

export class InstanceService extends Service {
  get events(): InstanceWatcher {
    return this.emitter
  }

  public readonly sandbox: InstanceSandbox
  private destroyed: boolean
  private emitter: InstanceEmitter
  private invalidator: InstanceInvalidator
  private monitoring: InstanceMonitoring
  private cache!: ServerCache<uuid, ConduitInstance<any, any>>
  private logger: Logger
  private lazyLoadingEnabled!: boolean

  constructor(
    private loggerService: LoggerService,
    private distributedService: DistributedService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private conduitService: ConduitService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private clientService: ClientService,
    private mappingService: MappingService,
    private statusService: StatusService,
    private app: App
  ) {
    super()
    this.destroyed = false
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
    this.lazyLoadingEnabled = !yn(process.env.NO_LAZY_LOADING)

    this.cache = await this.cachingService.newServerCache('cache_instance_by_conduit_id', {
      dispose: async (k, v) => {
        if (!this.destroyed) {
          await this.handleCacheDispose(k, v)
        }
      },
      max: 50000,
      maxAge: ms('30min')
    })

    await this.invalidator.setup(this.cache)

    this.messageService.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))
  }

  async destroy() {
    this.destroyed = true

    if (!this.cache) {
      return
    }

    for (const conduitId of this.cache.keys()) {
      const instance = this.cache.get(conduitId)
      if (instance) {
        await this.handleCacheDispose(conduitId, instance)
      }
    }
  }

  async monitor() {
    await this.monitoring.monitor()
  }

  async initialize(conduitId: uuid) {
    const instance = await this.get(conduitId)

    try {
      await this.distributedService.using(`lock_dyn_instance_init::${conduitId}`, async () => {
        await instance.initialize()
      })
    } catch (e) {
      this.cache.del(conduitId)

      await this.statusService.addError(conduitId, e)
      instance.logger.error(e, 'Error trying to initialize conduit')

      return this.emitter.emit(InstanceEvents.InitializationFailed, conduitId)
    }

    await this.conduitService.updateInitialized(conduitId)
    await this.statusService.clearErrors(conduitId)
    return this.emitter.emit(InstanceEvents.Initialized, conduitId)
  }

  async get(conduitId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cache.get(conduitId)
    if (cached) {
      return cached
    }

    const conduit = (await this.conduitService.get(conduitId))!
    const channel = this.channelService.getById(conduit.channelId)
    const instance = channel.createConduit()

    try {
      await this.distributedService.using(`lock_dyn_instance_setup::${conduitId}`, async () => {
        await instance.setup(conduitId, conduit.config, this.app)
      })
      this.cache.set(conduitId, instance, channel.lazy && this.lazyLoadingEnabled ? undefined : Infinity)

      await this.emitter.emit(InstanceEvents.Setup, conduitId)
    } catch (e) {
      this.cache.del(conduitId)

      await this.statusService.addError(conduitId, e)
      instance.logger.error(e, 'Error trying to setup conduit')

      await this.emitter.emit(InstanceEvents.SetupFailed, conduitId)
    }

    return instance
  }

  private async handleCacheDispose(conduitId: uuid, instance: ConduitInstance<any, any>) {
    try {
      await instance.destroy()
      await this.emitter.emit(InstanceEvents.Destroyed, conduitId)
    } catch (e) {
      this.logger.error(e, 'Error trying to destroy conduit')
    }
  }

  private async handleMessageCreated({ message, source }: MessageCreatedEvent) {
    const conversation = await this.conversationService.get(message.conversationId)
    const client = await this.clientService.getById(conversation!.clientId)
    const convmaps = await this.mappingService.convmap.listByConversationId(message.conversationId)

    for (const convmap of convmaps) {
      void this.sendMessageToInstance(message, source, client!.providerId, convmap)
    }
  }

  private async sendMessageToInstance(
    message: Message,
    source: ActionSource | undefined,
    providerId: uuid,
    convmap: Convmap
  ) {
    try {
      const endpoint = await this.mappingService.getEndpoint(convmap.threadId)
      const tunnel = await this.mappingService.tunnels.get(convmap.tunnelId)

      if (
        !source?.conduit ||
        (source.conduit.endpoint.identity || '*') !== endpoint.identity ||
        (source.conduit.endpoint.sender || '*') !== endpoint.sender ||
        (source.conduit.endpoint.thread || '*') !== endpoint.thread
      ) {
        const conduit = await this.conduitService.getByProviderAndChannel(providerId, tunnel!.channelId)
        if (!conduit) {
          return
        }

        const instance = await this.get(conduit!.id)
        await instance.sendToEndpoint(endpoint, message.payload)
      }
    } catch (e) {
      this.logger.error(e, 'Failed to send message to instance')
    }
  }
}
