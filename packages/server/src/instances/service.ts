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
import { InstanceClearingService } from './clearing/service'
import { InstanceInvalidationService } from './invalidation/service'
import { InstanceLifetimeService } from './lifetime/service'
import { InstanceMonitoringService } from './monitoring/service'
import { LinkedQueue } from './queue'
import { InstanceSandboxService } from './sandbox/service'

export class InstanceService extends Service {
  lifetimes: InstanceLifetimeService
  invalidation: InstanceInvalidationService
  clearing: InstanceClearingService
  monitoring: InstanceMonitoringService
  sandbox: InstanceSandboxService

  private messageQueueCache!: ServerCache<uuid, LinkedQueue<QueuedMessage>>
  private logger: Logger

  constructor(
    private loggers: LoggerService,
    private distributed: DistributedService,
    private dispatches: DispatchService,
    private caching: CachingService,
    private channels: ChannelService,
    private providers: ProviderService,
    private conduits: ConduitService,
    private conversations: ConversationService,
    private messages: MessageService,
    private clients: ClientService,
    private mapping: MappingService,
    private status: StatusService
  ) {
    super()
    this.logger = this.loggers.root.sub('instances')
    this.lifetimes = new InstanceLifetimeService(
      this.distributed,
      this.dispatches,
      this.channels,
      this.providers,
      this.conduits,
      this.status,
      this.logger
    )
    this.invalidation = new InstanceInvalidationService(
      this.channels,
      this.providers,
      this.conduits,
      this.clients,
      this.status,
      this.lifetimes
    )
    this.clearing = new InstanceClearingService(caching, channels, providers, conduits, this.lifetimes, this.logger)
    this.monitoring = new InstanceMonitoringService(
      this.logger.sub('monitoring'),
      this.distributed,
      this.channels,
      this.conduits,
      this.status,
      this.lifetimes
    )
    this.sandbox = new InstanceSandboxService(this.clients, this.mapping, this)
  }

  async setup() {
    await this.lifetimes.setup()
    await this.invalidation.setup()
    await this.clearing.setup()
    await this.sandbox.setup()

    this.messageQueueCache = await this.caching.newServerCache('cache_thread_queues_cache')
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))
  }

  async destroy() {
    await this.monitoring.destroy()
    await this.clearing.destroy()

    for (const channel of this.channels.list()) {
      for (const scope of channel.scopes) {
        const provider = await this.providers.getByName(scope)
        const conduit = await this.conduits.getByProviderAndChannel(provider.id, channel.meta.id)

        await this.lifetimes.stop(conduit.id)
      }
    }
  }

  async monitor() {
    await this.monitoring.setup()
  }

  async sendToEndpoint(conduitId: uuid, endpoint: Endpoint, content: any) {
    const conduit = await this.conduits.get(conduitId)
    const provider = await this.providers.getById(conduit.providerId)
    const channel = this.channels.getById(conduit.channelId)

    await channel.send(provider.name, endpoint, content)
  }

  private async handleMessageCreated({ message, source }: MessageCreatedEvent) {
    const conversation = await this.conversations.get(message.conversationId)
    const client = await this.clients.getById(conversation.clientId)
    const convmaps = await this.mapping.convmap.listByConversationId(message.conversationId)

    // small optimization. If the message comes from a channel, and we are only linked to one channel,
    // then we already know that we don't need to spread the message to other connected channels
    if (convmaps.length === 1 && source?.endpoint) {
      return
    }

    for (const { threadId, tunnelId } of convmaps) {
      const endpoint = await this.mapping.getEndpoint(threadId)
      const tunnel = await this.mapping.tunnels.get(tunnelId)

      if (!source?.endpoint || !this.endpointEqual(source.endpoint, endpoint)) {
        const conduit = await this.conduits.fetchByProviderAndChannel(client.providerId, tunnel!.channelId)
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
