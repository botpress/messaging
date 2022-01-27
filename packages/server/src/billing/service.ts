import { Logger, LoggerService, Service } from '@botpress/messaging-engine'
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
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))

    void this.tickBilling()
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
    for (const [clientId, stat] of Object.entries(this.stats)) {
      const count = await this.messages.countByClientId(clientId)

      this.logger.info(`${clc.blackBright(`[${clientId}]`)} ${clc.cyan('stats')}`, { count, ...stat })
      // TODO: make a call to billing route here
    }

    this.stats = {}
  }
}
