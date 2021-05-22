import { ChannelSender } from '../../base/sender'
import { SmoochContext } from '../context'

export class SmoochCommonSender implements ChannelSender<SmoochContext> {
  get priority(): number {
    return 0
  }

  handles(context: SmoochContext): boolean {
    return context.handlers > 0
  }

  async send(context: SmoochContext) {
    for (const message of context.messages) {
      await context.client.appUsers.sendMessage({
        appId: context.client.keyId,
        userId: context.foreignUserId,
        message: { ...message, role: 'appMaker' }
      })
    }
  }
}
