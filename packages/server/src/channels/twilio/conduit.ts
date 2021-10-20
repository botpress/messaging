import _ from 'lodash'
import { Twilio } from 'twilio'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { TypingSender } from '../base/senders/typing'
import { TwilioConfig } from './config'
import { TwilioContext, TwilioRequestBody } from './context'
import { TwilioRenderers } from './renderers'
import { TwilioSenders } from './senders'

export class TwilioConduit extends ConduitInstance<TwilioConfig, TwilioContext> {
  private twilio!: Twilio
  public webhookUrl!: string

  protected async setupConnection() {
    if (!yn(process.env.TWILIO_TESTING)) {
      this.twilio = new Twilio(this.config.accountSID, this.config.authToken)
    }
    this.webhookUrl = await this.getRoute()

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...TwilioRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...TwilioSenders]
  }

  public async extractEndpoint(payload: TwilioRequestBody): Promise<EndpointContent> {
    const botPhoneNumber = payload.To
    const userId = payload.From

    const index = Number(payload.Body)
    const content = this.handleIndexResponse(index, botPhoneNumber, userId) || { type: 'text', text: payload.Body }

    return {
      content,
      identity: botPhoneNumber,
      sender: userId
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<TwilioContext> {
    return {
      ...base,
      client: this.twilio,
      messages: [],
      prepareIndexResponse: this.prepareIndexResponse.bind(this)
    }
  }
}
