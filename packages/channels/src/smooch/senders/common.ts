import { CommonSender } from '../../base/senders/common'
import { SmoochContext } from '../context'

export class SmoochCommonSender extends CommonSender {
  async send(context: SmoochContext) {
    for (const message of context.messages) {
      await context.state.smooch.appUsers.sendMessage({
        appId: context.state.config.keyId,
        userId: context.sender,
        message: { ...message, role: 'appMaker' }
      })
    }
  }
}
