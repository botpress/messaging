import { TypingSender } from '../../base/senders/typing'
import { SmoochContext } from '../context'

export class SmoochTypingSender extends TypingSender {
  async sendIndicator(context: SmoochContext) {
    await context.state.smooch.appUsers.conversationActivity({
      appId: context.state.config.keyId,
      userId: context.sender,
      activityProps: {
        role: 'appMaker',
        type: 'typing:start'
      }
    })
  }
}
