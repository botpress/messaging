import ms from 'ms'
import { CommonSender } from '../../base/senders/common'
import { TwilioContext } from '../context'

export class TwilioCommonSender extends CommonSender {
  async send(context: TwilioContext) {
    for (const message of context.messages) {
      await context.state.twilio.messages.create({
        ...message,
        from: context.identity,
        to: context.sender
      })

      const { messageDelay } = context.state.config
      if (messageDelay) {
        // depending on the account it might be required to limit the rps to each number
        // usually this is an issue for carousels
        await new Promise((resolve) => setTimeout(resolve, ms(messageDelay)))
      }
    }
  }
}
