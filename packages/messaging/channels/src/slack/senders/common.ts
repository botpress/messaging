import { CommonSender } from '../../base/senders/common'
import { SlackContext } from '../context'

export class SlackCommonSender extends CommonSender {
  async send(context: SlackContext) {
    await context.state.app.client.chat.postMessage({
      ...context.message,
      text: context.message.text || context.payload.type
    })
  }
}
