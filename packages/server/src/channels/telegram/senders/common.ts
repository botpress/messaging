import { CommonSender } from '../../base/senders/common'
import { TelegramContext } from '../context'

export class TelegramCommonSender extends CommonSender {
  async send(context: TelegramContext) {
    const { client } = context
    const chatId = context.thread!

    for (const message of context.messages) {
      if ('action' in message) {
        await client.telegram.sendChatAction(chatId, message.action)
      }
      if ('text' in message) {
        await client.telegram.sendMessage(chatId, message.text, message.extra)
      }
      if ('photo' in message) {
        await client.telegram.sendPhoto(chatId, message.photo, message.extra)
      }
      if ('animation' in message) {
        await client.telegram.sendAnimation(chatId, message.animation, message.extra)
      }
    }
  }
}
