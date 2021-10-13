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
    const collectors = this.collectors[message.conversationId]

    for (const collector of collectors || []) {
      collector.messages.push(message)
    }
  }

  async collect(conversationId: uuid): Promise<Message[]> {
    const collector = this.addCollector(conversationId)

    return new Promise<Message[]>((resolve) => {
      setTimeout(() => {
        this.removeCollector(conversationId, collector)
        resolve(collector.messages)
      }, 5000)
    })
  }

  private addCollector(conversationId: uuid): Collector {
    if (!this.collectors[conversationId]) {
      this.collectors[conversationId] = []
    }

    const collector: Collector = {
      messages: []
    }

    this.collectors[conversationId].push(collector)

    return collector
  }

  private removeCollector(conversationId: uuid, collector: Collector) {
    const index = this.collectors[conversationId].indexOf(collector)
    this.collectors[conversationId].splice(index, 1)

    if (this.collectors[conversationId].length === 0) {
      delete this.collectors[conversationId]
    }
  }
}
