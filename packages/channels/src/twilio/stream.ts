import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { TwilioService } from './service'

export class TwilioStream extends ChannelStream<TwilioService> {
  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const { twilio } = this.service.get(scope)

    await twilio.messages.create({
      body: content.text,
      from: endpoint.identity,
      to: endpoint.sender!
    })
  }
}
