import { CommonSender } from '../../base/senders/common'
import { SlackContext } from '../context'

export class SlackCommonSender extends CommonSender {
  async send(context: SlackContext) {
    for (const message of context.messages) {
      await context.state.app.client.chat.postMessage({ ...message, channel: context.thread })
    }
  }
}
