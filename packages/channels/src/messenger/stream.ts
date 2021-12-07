import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { MessengerService } from './service'

export class MessengerStream extends ChannelStream<MessengerService> {
  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const { client } = this.service.get(scope)
    await client.sendMessage(endpoint.sender, { text: content.text })
  }
}
