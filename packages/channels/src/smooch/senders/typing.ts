import { TypingSender } from '../../base/senders/typing'
import { SmoochContext } from '../context'
const SunshineConversationsClient = require('sunshine-conversations-client')

export class SmoochTypingSender extends TypingSender {
  async sendIndicator(context: SmoochContext) {
    const data = new SunshineConversationsClient.ActivityPost()
    data.author = {
      type: 'business'
    }
    data.type = 'typing:start'

    await context.state.smooch.activity.postActivity(context.state.config.appId, context.thread, data)
  }
}
