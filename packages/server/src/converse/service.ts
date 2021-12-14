import { Message, uuid } from '@botpress/messaging-base'
import { CachingService, DispatchService, ServerCache, Service } from '@botpress/messaging-engine'
import ms from 'ms'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { ConverseDispatcher, ConverseDispatches, ConverseMessageDispatch, ConverseStopDispatch } from './dispatch'
import { Collector } from './types'

const DEFAULT_COLLECT_TIMEOUT = ms('10s')

export class ConverseService extends Service {
  private collectors!: ServerCache<uuid, Collector[]>
  private incomingIdCache!: ServerCache<uuid, uuid>
  private collectingForMessageCache!: ServerCache<uuid, boolean>
  private dispatcher!: ConverseDispatcher

  constructor(private caching: CachingService, private dispatches: DispatchService, private messages: MessageService) {
    super()
  }

  async setup() {
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))

    this.collectors = await this.caching.newServerCache('cache_converse_collectors', {})
    this.incomingIdCache = await this.caching.newServerCache('cache_converse_incoming_id')
    this.collectingForMessageCache = await this.caching.newServerCache('cache_converse_collecting_for_message')

    this.dispatcher = await this.dispatches.create('dispatch_converse', ConverseDispatcher)
    this.dispatcher.on(ConverseDispatches.Message, this.handleDispatchMessage.bind(this))
    this.dispatcher.on(ConverseDispatches.Stop, this.handleDispatchStop.bind(this))
  }

  private async handleMessageCreated({ message }: MessageCreatedEvent) {
    if (message.authorId) {
      // we only collect bot messages
      return
    }

    const incomingId = this.incomingIdCache.get(message.id)
    if (incomingId) {
      await this.dispatcher.publish(ConverseDispatches.Message, incomingId, { message })
    }
  }

  private async handleDispatchMessage(incomingId: uuid, data: ConverseMessageDispatch) {
    const message = { ...data.message, sentOn: new Date(data.message.sentOn) }
    const collectors = this.collectors.get(message.conversationId) || []

    for (const collector of collectors) {
      if (!incomingId || incomingId === collector.incomingId) {
        collector.messages.push(message)
      }
    }
  }

  private async handleDispatchStop(incomingId: uuid, { conversationId }: ConverseStopDispatch) {
    const collectors = this.collectors.get(conversationId) || []
    const childCollectors = collectors.filter((x) => x.incomingId === incomingId)

    for (const collector of childCollectors) {
      if (collector.timeout) {
        clearTimeout(collector.timeout)
      }
      this.removeCollector(collector)
      this.resolveCollect(collector)
    }

    await this.dispatcher.unsubscribe(incomingId)
  }

  setIncomingId(messageId: uuid, incomingId: uuid) {
    this.incomingIdCache.set(messageId, incomingId)
  }

  isCollectingForMessage(messageId: uuid) {
    return !!this.collectingForMessageCache.get(messageId)
  }

  async collect(messageId: uuid, conversationId: uuid, timeout: number): Promise<Message[]> {
    await this.dispatcher.subscribe(messageId)

    const collector = this.addCollector(messageId, conversationId)
    if (timeout !== 0) {
      this.resetCollectorTimeout(collector, timeout || DEFAULT_COLLECT_TIMEOUT)
    }

    this.collectingForMessageCache.set(messageId, true)

    return new Promise<Message[]>((resolve) => {
      collector.resolve = resolve
    })
  }

  async stopCollecting(messageId: uuid, conversationId: uuid) {
    await this.dispatcher.publish(ConverseDispatches.Stop, messageId, { conversationId })
  }

  private addCollector(messageId: uuid, conversationId: uuid): Collector {
    let collectors = this.collectors.get(conversationId)

    if (!collectors) {
      collectors = []
      this.collectors.set(conversationId, collectors)
    }

    const collector: Collector = {
      incomingId: messageId,
      conversationId,
      messages: []
    }

    collectors.push(collector)

    return collector
  }

  private resolveCollect(collector: Collector) {
    if (collector.resolve) {
      collector.resolve(collector.messages)
      collector.resolve = undefined
    }
  }

  private removeCollector(collector: Collector) {
    const { conversationId } = collector

    const collectors = this.collectors.get(conversationId) || []
    const index = collectors.indexOf(collector)
    if (index >= 0) {
      collectors.splice(index, 1)
    }

    if (!collectors.length) {
      this.collectors.del(conversationId)
    }
  }

  private resetCollectorTimeout(collector: Collector, time: number) {
    if (collector.timeout) {
      clearTimeout(collector.timeout)
    }

    collector.timeout = setTimeout(() => {
      this.removeCollector(collector)
      this.resolveCollect(collector)
    }, time)
  }
}
