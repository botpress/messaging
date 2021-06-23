import { CommonSender } from '../../base/senders/common'
import { TwilioContext } from '../context'

export class TwilioCommonSender extends CommonSender {
  async send(context: TwilioContext) {
    for (const message of context.messages) {
      await context.client.messages.create({
        ...message,
        from: context.identity,
        to: context.sender!
      })
    }
  }
}
