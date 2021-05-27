import { TypingSender } from '../../base/senders/typing'
import { DiscordContext } from '../context'

export class DiscordTypingSender extends TypingSender {
  async sendIndicator(context: DiscordContext) {
    void context.channel.startTyping()
  }

  async stopIndicator(context: DiscordContext) {
    context.channel.stopTyping(true)
  }
}
