import { Endpoint } from '../base/endpoint'
import { ChannelStream } from '../base/stream'
import { MessengerService } from './service'

export class MessengerStream extends ChannelStream<MessengerService> {
  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  private async handleSend({ scope, endpoint, content }: { scope: string; endpoint: Endpoint; content: any }) {
    const { client } = this.service.get(scope)
    await client.sendMessage(endpoint.sender, { text: content.text })
  }
}
