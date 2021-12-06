import { Endpoint } from '../base/endpoint'
import { ChannelStream } from '../base/stream'
import { SlackService } from './service'

export class SlackStream extends ChannelStream<SlackService> {
  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  private async handleSend({ scope, endpoint, content }: { scope: string; endpoint: Endpoint; content: any }) {
    const { client } = this.service.get(scope)

    await client.chat.postMessage({
      channel: endpoint.thread,
      text: content.text
    })
  }
}
