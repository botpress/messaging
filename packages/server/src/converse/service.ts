import { Message, uuid } from '@botpress/messaging-base'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { Collector } from './types'

export class ConverseService extends Service {
  private collectors!: ServerCache<uuid, Collector[]>
  private incomingIdCache!: ServerCache<uuid, uuid>

  constructor(private caching: CachingService, private messages: MessageService) {
    super()
  }

  async setup() {
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))

    this.collectors = await this.caching.newServerCache('cache_converse_collectors', {})
    this.incomingIdCache = await this.caching.newServerCache('cache_converse_hints')
  }

  private async handleMessageCreated({ message }: MessageCreatedEvent) {
    if (message.authorId) {
      // we only collect bot messages
      return
    }

    const incomingId = this.incomingIdCache.get(message.id)
    const collectors = this.collectors.get(message.conversationId) || []

    for (const collector of collectors) {
      if (!incomingId || incomingId === collector.messageId) {
        collector.messages.push(message)
      }
    }
  }

  setIncomingId(messageId: uuid, incomingId: uuid) {
    this.incomingIdCache.set(messageId, incomingId)
  }

  async collect(messageId: uuid, conversationId: uuid): Promise<Message[]> {
    const collector = this.addCollector(messageId, conversationId)
    this.resetCollectorTimeout(collector, 5000)

    return new Promise<Message[]>((resolve) => {
      collector.resolve = resolve
    })
  }

  async stopCollecting(messageId: uuid, conversationId: uuid) {
    const collectors = this.collectors.get(conversationId) || []

    for (const collector of collectors) {
      if (collector.messageId === messageId) {
        clearTimeout(collector.timeout!)

        if (collector.resolve) {
          collector.resolve(collector.messages)
        }
      }
    }
  }

  private addCollector(messageId: uuid, conversationId: uuid): Collector {
    let collectors = this.collectors.get(conversationId)

    if (!collectors) {
      collectors = []
      this.collectors.set(conversationId, collectors)
    }

    const collector: Collector = {
      messageId,
      conversationId,
      messages: []
    }

    collectors.push(collector)

    return collector
  }

  private removeCollector(collector: Collector) {
    const { conversationId } = collector

    const collectors = this.collectors.get(conversationId)!
    const index = collectors.indexOf(collector)
    collectors.splice(index, 1)

    if (collectors.length === 0) {
      this.collectors.del(conversationId)
    }
  }

  private resetCollectorTimeout(collector: Collector, time: number) {
    if (collector.timeout) {
      clearTimeout(collector.timeout)
    }

    collector.timeout = setTimeout(() => {
      this.removeCollector(collector)
      collector.resolve!(collector.messages)
      collector.resolve = undefined
    }, time)
  }
}
