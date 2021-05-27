import { CommonSender } from '../../base/senders/common'
import { DiscordContext } from '../context'

export class DiscordCommonSender extends CommonSender {
  async send(context: DiscordContext) {
    for (const message of context.messages) {
      if (message.content && message.options) {
        await context.channel.send(message.content, message.options)
      } else if (message.content) {
        await context.channel.send(message.content)
      } else if (message.options) {
        await context.channel.send(message.options)
      }
    }
  }
}
