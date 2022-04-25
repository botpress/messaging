import { Message, uuid } from '@botpress/messaging-base'
import { Endpoint } from '@botpress/messaging-channels'
import { CachingService, Logger, ServerCache, Service } from '@botpress/messaging-engine'
import { ChannelService } from '../../channels/service'
import { ConduitService } from '../../conduits/service'
import { ConversationService } from '../../conversations/service'
import { MappingService } from '../../mapping/service'
import { MessageCreatedEvent, MessageEvents } from '../../messages/events'
import { MessageService } from '../../messages/service'
import { ProviderService } from '../../providers/service'
import { ProvisionService } from '../../provisions/service'
import { LinkedQueue } from './queue'

export class InstanceMessagingService extends Service {
  private messageQueueCache!: ServerCache<uuid, LinkedQueue<QueuedMessage>>

  constructor(
    private caching: CachingService,
    private channels: ChannelService,
    private providers: ProviderService,
    private provisions: ProvisionService,
    private conduits: ConduitService,
    private conversations: ConversationService,
    private messages: MessageService,
    private mapping: MappingService,
    private logger: Logger
  ) {
    super()
  }

  async setup() {
    this.messageQueueCache = await this.caching.newServerCache('cache_thread_queues_cache')
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))
  }

  async send(conduitId: uuid, endpoint: Endpoint, content: any) {
    const conduit = await this.conduits.get(conduitId)
    const provider = await this.providers.getById(conduit.providerId)
    const channel = this.channels.getById(conduit.channelId)

    await channel.send(provider.name, endpoint, content)
  }

  private async handleMessageCreated({ message, source }: MessageCreatedEvent) {
    const conversation = await this.conversations.get(message.conversationId)
    const provision = await this.provisions.fetchByClientId(conversation.clientId)
    if (!provision) {
      return
    }

    const convmaps = await this.mapping.convmap.listByConversationId(message.conversationId)

    // small optimization. If the message comes from a channel, and we are only linked to one channel,
    // then we already know that we don't need to spread the message to other connected channels
    if (convmaps.length === 1 && source?.endpoint) {
      return
    }

    for (const { threadId, tunnelId } of convmaps) {
      const endpoint = await this.mapping.getEndpoint(threadId)
      const tunnel = await this.mapping.tunnels.get(tunnelId)
      if (!tunnel?.channelId) {
        continue
      }

      if (!source?.endpoint || !this.endpointEqual(source.endpoint, endpoint)) {
        const conduit = await this.conduits.fetchByProviderAndChannel(provision.providerId, tunnel.channelId)
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
          await this.send(item.conduitId, item.endpoint, item.message.payload)
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
