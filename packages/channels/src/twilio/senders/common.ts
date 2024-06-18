import { backOff } from 'exponential-backoff'
import ms from 'ms'
import { CommonSender } from '../../base/senders/common'
import { TwilioContext } from '../context'

const DEFAULT_MAX_ATTEMPTS = 3

export class TwilioCommonSender extends CommonSender {
  async send(context: TwilioContext) {
    for (const message of context.messages) {
      const { messageDelay, retryDelay, retryMaxAttempts = DEFAULT_MAX_ATTEMPTS } = context.state.config
      await backOff(
        async () => {
          await context.state.twilio.messages.create({
            ...message,
            from: context.identity,
            to: context.sender
          })

          if (messageDelay) {
            // depending on the account it might be required to limit the rps to each number
            // usually this is an issue for carousels
            await new Promise((resolve) => setTimeout(resolve, ms(messageDelay)))
          }
        },
        {
          jitter: 'none',
          numOfAttempts: retryMaxAttempts,
          startingDelay: (retryDelay && ms(retryDelay)) || 1000,
          retry: (e, attemptNumber) => {
            if (attemptNumber === 1) {
              context.logger?.error(
                e,
                `Failed to send message to Twilio on first attempt. Retrying ${retryMaxAttempts} more times`
              )
            } else {
              context.logger?.error(e, `Failed again, retry: ${attemptNumber}`)
            }
            return true
          }
        }
      )
    }
  }
}
