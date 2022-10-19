import { Service } from '@botpress/messaging-engine'
import * as promex from '@bpinternal/promex'
import { defaultNormalizers } from '@promster/express'
import type { Express } from 'express'
import client from 'prom-client'
import yn from 'yn'
import { ConversationEvents } from '../conversations/events'
import { ConversationService } from '../conversations/service'
import { MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'

const messagesCount = new client.Counter({
  name: 'messages_total',
  help: 'Counter of all messages.'
})

const conversationsCount = new client.Counter({
  name: 'conversations_total',
  help: 'Counter of all conversations.'
})

export class MetricsService extends Service {
  private metricsEnabled: boolean
  private port: number

  constructor(private conversations: ConversationService, private messages: MessageService) {
    super()
    this.metricsEnabled = yn(process.env.METRICS_ENABLED) ?? false
    this.port = process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT) : 9090
  }

  async destroy() {
    if (!this.metricsEnabled) {
      return
    }

    await promex.stop()
  }

  init(app: Express) {
    if (!this.metricsEnabled) {
      return
    }

    promex.config({ normalizePath: defaultNormalizers.normalizePath })
    promex.init(app)
  }

  async setup() {
    if (!this.metricsEnabled) {
      return
    }

    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))
    this.conversations.events.on(ConversationEvents.Created, this.handleConversationCreated.bind(this))

    await promex.start({ port: this.port })
  }

  private async handleMessageCreated() {
    messagesCount.inc()
  }

  private async handleConversationCreated() {
    conversationsCount.inc()
  }
}
