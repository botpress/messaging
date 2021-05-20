import { ExtraPhoto } from 'telegraf/typings/telegram-types'
import { ChannelSender } from '../../base/sender'
import { TelegramContext } from '../context'

export class TelegramCommonSender implements ChannelSender<TelegramContext> {
  get priority(): number {
    return 0
  }

  handles(context: TelegramContext): boolean {
    return context.handlers.length > 0
  }

  async send(context: TelegramContext) {
    const { client, chatId } = context

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
