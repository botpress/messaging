import { CommonSender } from '../../base/senders/common'
import { TelegramContext } from '../context'

export class TelegramCommonSender extends CommonSender {
  async send(context: TelegramContext) {
    const telegram = context.state.telegraf.telegram
    const chatId = context.thread

    for (const message of context.messages) {
      if (message.action) {
        await telegram.sendChatAction(chatId, message.action)
      }
      if (message.text) {
        await telegram.sendMessage(chatId, message.text, message.extra)
      }
      if (message.photo) {
        await telegram.sendPhoto(chatId, message.photo, message.extra)
      }
      if (message.animation) {
        await telegram.sendAnimation(chatId, message.animation, message.extra)
      }
      if (message.document) {
        await telegram.sendDocument(chatId, message.document, message.extra)
      }
    }
  }
}
