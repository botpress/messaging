import { ExtraPhoto } from 'telegraf/typings/telegram-types'
import { CommonSender } from '../../base/senders/common'
import { TelegramContext } from '../context'

export class TelegramCommonSender extends CommonSender {
  async send(context: TelegramContext) {
    const { client } = context
    const chatId = context.foreignConversationId!

    for (const message of context.messages) {
      if (message.action) {
        await client.telegram.sendChatAction(chatId, message.action)
      }
      if (message.text) {
        await client.telegram.sendMessage(chatId, message.text, message.extra)
      }
      if (message.photo) {
        await client.telegram.sendPhoto(chatId, message.photo, <ExtraPhoto>message.extra)
      }
      if (message.animation) {
        await client.telegram.sendAnimation(chatId, message.animation, message.extra)
      }
    }
  }
}
