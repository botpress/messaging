import { CommonSender } from '../../base/senders/common'
import { SmoochContext } from '../context'

export class SmoochCommonSender extends CommonSender {
  async send(context: SmoochContext) {
    for (const message of context.messages) {
      await context.state.smooch.messages.postMessage(context.state.config.appId, context.thread, message)
    }
  }
}
