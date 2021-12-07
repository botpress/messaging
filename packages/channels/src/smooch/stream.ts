import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { SmoochService } from './service'

export class SmoochStream extends ChannelStream<SmoochService> {
  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const { smooch } = this.service.get(scope)

    await smooch.appUsers.sendMessage({
      appId: smooch.keyId,
      userId: endpoint.sender,
      message: { type: 'text', text: content.text, role: 'appMaker' }
    })
  }
}
