import { Message, uuid } from '@botpress/messaging-base'
import { Service } from '../base/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { Collector } from './types'

export class ConverseService extends Service {
  private collectors: { [conversationId: string]: Collector[] } = {}

  constructor(private messages: MessageService) {
    super()
  }

  async setup() {
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))
  }

  private async handleMessageCreated({ message }: MessageCreatedEvent) {
    const collectors = this.collectors[message.conversationId] || []

    for (const collector of collectors) {
      collector.messages.push(message)
      this.resetCollectorTimeout(collector, 250)
    }
  }

  async collect(conversationId: uuid): Promise<Message[]> {
    const collector = this.addCollector(conversationId)
    this.resetCollectorTimeout(collector, 5000)

    return new Promise<Message[]>((resolve) => {
      collector.resolve = resolve
    })
  }

  private addCollector(conversationId: uuid): Collector {
    if (!this.collectors[conversationId]) {
      this.collectors[conversationId] = []
    }

    const collector: Collector = {
      conversationId,
      messages: []
    }

    this.collectors[conversationId].push(collector)

    return collector
  }

  private removeCollector(collector: Collector) {
    const { conversationId } = collector

    const index = this.collectors[conversationId].indexOf(collector)
    this.collectors[conversationId].splice(index, 1)

    if (this.collectors[conversationId].length === 0) {
      delete this.collectors[conversationId]
    }
  }

  private resetCollectorTimeout(collector: Collector, time: number) {
    if (collector.timeout) {
      clearTimeout(collector.timeout)
    }

    collector.timeout = setTimeout(() => {
      this.removeCollector(collector)
      collector.resolve!(collector.messages)
    }, time)
  }
}
