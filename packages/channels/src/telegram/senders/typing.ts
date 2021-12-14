import { TypingSender } from '../../base/senders/typing'
import { TelegramContext } from '../context'

export class TelegramTypingSender extends TypingSender {
  async sendIndicator(context: TelegramContext) {
    await context.state.telegraf.telegram.sendChatAction(context.thread, 'typing')
  }
}
