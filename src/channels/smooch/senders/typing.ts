import { ChannelSender } from '../../base/sender'
import { SmoochContext } from '../context'

export class SmoochTypingSender implements ChannelSender<SmoochContext> {
  get priority(): number {
    return -1
  }

  handles(context: SmoochContext): boolean {
    const typing = context.payload.typing
    return context.handlers > 0 && (typing === undefined || typing === true)
  }

  async send(context: SmoochContext) {
    const delay = context.payload.delay ?? 1000

    await context.client.appUsers.conversationActivity({
      appId: context.client.keyId,
      userId: context.foreignUserId,
      activityProps: {
        role: 'appMaker',
        type: 'typing:start'
      }
    })

    // await Promise.delay(delay)
  }
}
