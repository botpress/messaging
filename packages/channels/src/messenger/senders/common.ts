import { CommonSender } from '../../base/senders/common'
import { MessengerContext } from '../context'

export class MessengerCommonSender extends CommonSender {
  async send(context: MessengerContext) {
    for (const message of context.messages) {
      await context.stream.sendMessage(context.scope, context, message)
    }
  }
}
