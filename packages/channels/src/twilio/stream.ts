import { Endpoint } from '../base/endpoint'
import { TwilioService } from './service'

export class TwilioStream {
  constructor(private readonly service: TwilioService) {}

  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  private async handleSend({ scope, endpoint, content }: { scope: string; endpoint: Endpoint; content: any }) {
    const { twilio } = this.service.get(scope)

    await twilio.messages.create({
      body: content.text,
      from: endpoint.identity,
      to: endpoint.sender!
    })
  }
}
