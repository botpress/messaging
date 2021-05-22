import { ChannelSender } from '../../base/sender'
import { MessengerContext } from '../context'

export class MessengerCommonSender implements ChannelSender<MessengerContext> {
  get priority(): number {
    return 0
  }

  handles(context: MessengerContext): boolean {
    return context.handlers > 0
  }

  async send(context: MessengerContext) {
    for (const message of context.messages) {
      await context.client.sendMessage(context.foreignUserId!, message)
    }
  }
}
