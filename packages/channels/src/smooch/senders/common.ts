import { CommonSender } from '../../base/senders/common'
import { SmoochContext } from '../context'
const SunshineConversationsClient = require('sunshine-conversations-client')

export class SmoochCommonSender extends CommonSender {
  async send(context: SmoochContext) {
    for (const message of context.messages) {
      const data = new SunshineConversationsClient.MessagePost()
      data.author = {
        type: 'business'
      }
      data.content = message

      await context.state.smooch.messages.postMessage(context.state.config.appId, context.thread, data)
    }
  }
}
