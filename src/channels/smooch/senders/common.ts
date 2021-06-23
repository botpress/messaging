import { CommonSender } from '../../base/senders/common'
import { SmoochContext } from '../context'

export class SmoochCommonSender extends CommonSender {
  async send(context: SmoochContext) {
    for (const message of context.messages) {
      await context.client.appUsers.sendMessage({
        appId: context.client.keyId,
        userId: context.sender,
        message: { ...message, role: 'appMaker' }
      })
    }
  }
}
