import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { TelegramService } from './service'

export class TelegramStream extends ChannelStream<TelegramService> {
  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const telegram = this.service.get(scope).telegraf.telegram
    await telegram.sendMessage(endpoint.thread, content.text)
  }
}
