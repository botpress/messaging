import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { SlackService } from './service'

export class SlackStream extends ChannelStream<SlackService> {
  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const { client } = this.service.get(scope)

    await client.chat.postMessage({
      channel: endpoint.thread,
      text: content.text
    })
  }
}
