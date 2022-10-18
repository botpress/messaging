import { Logger, LoggerService, Service } from '@botpress/messaging-engine'
import * as promex from '@bpinternal/promex'
import { defaultNormalizers } from '@promster/express'
import clc from 'cli-color'
import type { Express } from 'express'
import client from 'prom-client'
import yn from 'yn'
import { ConversationCreatedEvent, ConversationEvents } from '../conversations/events'
import { ConversationService } from '../conversations/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
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
  private logger: Logger
  private metricsEnabled: boolean
  private port: number

  constructor(loggers: LoggerService, private conversations: ConversationService, private messages: MessageService) {
    super()
    this.metricsEnabled = yn(process.env.METRICS_ENABLED) ?? false
    this.port = process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT) : 9090
    this.logger = loggers.root.sub('metrics')
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

  private async handleMessageCreated({ message: { id } }: MessageCreatedEvent) {
    this.logger.debug(`${clc.blackBright(`[${id}]`)} ${clc.cyan('metrics')} messages incremented`)
    messagesCount.inc()
  }

  private async handleConversationCreated({ conversation: { id } }: ConversationCreatedEvent) {
    this.logger.debug(`${clc.blackBright(`[${id}]`)} ${clc.cyan('metrics')} conversations incremented`)
    conversationsCount.inc()
  }
}
