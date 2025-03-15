import { CommonSender } from '../../base/senders/common'
import { WhatsappContext } from '../context'

export class WhatsappCommonSender extends CommonSender {
  async send(context: WhatsappContext) {
    for (const message of context.messages) {
      await context.stream.sendMessage(context.scope, context, message)
    }
  }
}
