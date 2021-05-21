import { ChannelSender } from '../../base/sender'
import { SlackContext } from '../context'

export class SlackTypingSender implements ChannelSender<SlackContext> {
  get priority(): number {
    return -1
  }

  handles(context: SlackContext): boolean {
    const typing = context.payload.typing
    return context.handlers > 0 && (typing === undefined || typing === true)
  }

  async send(context: SlackContext): Promise<void> {
    const delay = context.payload.delay ?? 1000
    // it seems the only way to send typing indicators is with rtm which is deprecated...

    // TODO: this doesn't work??
    // await Promise.delay(delay)
  }
}
