import _ from 'lodash'
import { Twilio } from 'twilio'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TypingSender } from '../base/senders/typing'
import { TwilioConfig } from './config'
import { TwilioContext, TwilioRequestBody } from './context'
import { TwilioRenderers } from './renderers'
import { TwilioSenders } from './senders'

export class TwilioConduit extends ConduitInstance<TwilioConfig, TwilioContext> {
  private twilio!: Twilio
  public webhookUrl!: string

  protected async setupConnection() {
    this.twilio = new Twilio(this.config.accountSID, this.config.authToken)
    this.webhookUrl = await this.getRoute()

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TwilioRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...TwilioSenders]
  }

  public async extractEndpoint(payload: TwilioRequestBody): Promise<EndpointContent> {
    const botPhoneNumber = payload.To
    const userId = payload.From

    const index = Number(payload.Body)
    const text = this.handleIndexResponse(index, botPhoneNumber, userId) || payload.Body

    return {
      content: { type: 'text', text },
      identity: botPhoneNumber,
      sender: userId
    }
  }

  protected async context(base: ChannelContext<any>): Promise<TwilioContext> {
    return {
      ...base,
      client: this.twilio,
      messages: [],
      prepareIndexResponse: this.prepareIndexResponse.bind(this)
    }
  }
}
