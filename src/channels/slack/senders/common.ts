import { ChannelSender } from '../../base/sender'
import { SlackContext } from '../context'

export class SlackCommonSender implements ChannelSender<SlackContext> {
  get priority(): number {
    return 0
  }

  handles(context: SlackContext): boolean {
    return context.handlers > 0
  }

  async send(context: SlackContext) {
    await context.client.web.chat.postMessage({
      channel: context.foreignConversationId!,
      text: <any>undefined,
      ...context.message
    })
  }
}
