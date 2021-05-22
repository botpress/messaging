import { TypingSender } from '../../base/senders/typing'
import { SmoochContext } from '../context'

export class SmoochTypingSender extends TypingSender {
  async sendIndicator(context: SmoochContext) {
    await context.client.appUsers.conversationActivity({
      appId: context.client.keyId,
      userId: context.foreignUserId,
      activityProps: {
        role: 'appMaker',
        type: 'typing:start'
      }
    })
  }
}
