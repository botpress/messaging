import { ChannelSender } from '../../base/sender'
import { MessengerContext } from '../context'

export class MessengerTypingSender implements ChannelSender<MessengerContext> {
  get priority(): number {
    return -1
  }

  handles(context: MessengerContext): boolean {
    const typing = context.payload.typing
    return context.handlers > 0 && (typing === undefined || typing === true)
  }

  async send(context: MessengerContext) {
    const delay = context.payload.delay ?? 1000

    await context.client.sendAction(context.foreignUserId!, 'typing_on')
    // await Promise.delay(delay)
    await context.client.sendAction(context.foreignUserId!, 'typing_off')
  }
}
