import { Endpoint } from '../base/endpoint'
import { ChannelStream } from '../base/stream'
import { TelegramService } from './service'

export class TelegramStream extends ChannelStream<TelegramService> {
  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  private async handleSend({ scope, endpoint, content }: { scope: string; endpoint: Endpoint; content: any }) {
    const telegram = this.service.get(scope).telegraf.telegram
    return telegram.sendMessage(endpoint.thread, content.text)
  }
}
