import { Logger, LoggerService, Service } from '@botpress/messaging-engine'
import axios from 'axios'
import clc from 'cli-color'
import ms from 'ms'
import { ConversationService } from '../conversations/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'

export class BillingService extends Service {
  private logger: Logger
  private timeout?: NodeJS.Timeout
  private stats: { [clientId: string]: { received: number; sent: number } } = {}

  constructor(loggers: LoggerService, private conversations: ConversationService, private messages: MessageService) {
    super()
    this.logger = loggers.root.sub('billing')
  }

  async setup() {
    if (process.env.BILLING_ENDPOINT?.length) {
      this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))

      void this.tickBilling()
    }
  }

  async destroy() {
    try {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      await this.flushBilling()
    } catch (e) {
      this.logger.error(e, 'Failed to destroy billing')
    }
  }

  private async tickBilling() {
    try {
      await this.flushBilling()
    } catch (e) {
      this.logger.error(e, 'Error occurred in billing')
    } finally {
      this.timeout = setTimeout(this.tickBilling.bind(this), ms('3s'))
    }
  }

  private async handleMessageCreated({ message }: MessageCreatedEvent) {
    const conversation = await this.conversations.get(message.conversationId)
    const stat = this.stats[conversation.clientId] || { sent: 0, received: 0 }

    if (message.authorId) {
      stat.received++
    } else {
      stat.sent++
    }

    this.stats[conversation.clientId] = stat
  }

  private async flushBilling() {
    const entries = [...Object.entries(this.stats)]

    for (const [clientId, stat] of entries) {
      const sentStats = { ...stat }
      const timestamp = new Date().toISOString()

      stat.sent = 0
      stat.received = 0

      await axios.post(process.env.BILLING_ENDPOINT!, {
        meta: {
          timestamp,
          sender: 'messaging',
          type: 'messages_processed',
          schema_version: '1.0.0'
        },
        schema_version: '1.0.0',
        records: [
          {
            client_id: clientId,
            messages: sentStats,
            timestamp
          }
        ]
      })

      // it's possible that new stats have been entered while the post request
      // was waiting since it's async
      if (stat.received === 0 && stat.sent === 0) {
        delete this.stats[clientId]
      }

      this.logger.info(`${clc.blackBright(`[${clientId}]`)} ${clc.cyan('stats')}`, sentStats)
    }
  }
}
