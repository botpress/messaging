import { CommonSender } from '../../base/senders/common'
import { SlackContext } from '../context'

export class SlackCommonSender extends CommonSender {
  async send(context: SlackContext) {
    await context.state.client.chat.postMessage({
      channel: context.thread!,
      text: <any>undefined,
      ...context.message
    })
  }
}
