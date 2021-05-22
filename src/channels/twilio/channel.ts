import _ from 'lodash'
import { Twilio, validateRequest } from 'twilio'
import { Channel, EndpointContent } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TypingSender } from '../base/senders/typing'
import { TwilioConfig } from './config'
import { TwilioContext, TwilioRequestBody } from './context'
import { TwilioRenderers } from './renderers'
import { TwilioSenders } from './senders'

export class TwilioChannel extends Channel<TwilioConfig, TwilioContext> {
  get id() {
    return 'twilio'
  }

  get enableParsers(): boolean {
    return true
  }

  private twilio!: Twilio
  private webhookUrl!: string

  protected async setupConnection() {
    if (!this.config.accountSID || !this.config.authToken) {
      throw new Error('The accountSID and authToken must be configured to use this channel.')
    }

    this.twilio = new Twilio(this.config.accountSID, this.config.authToken)
    this.webhookUrl = this.config.externalUrl + this.route()

    this.router.post('/', async (req, res) => {
      const signature = req.headers['x-twilio-signature'] as string
      if (validateRequest(this.config.authToken!, signature, this.webhookUrl, req.body)) {
        await this.receive(req.body)
        res.sendStatus(204)
      } else {
        res.status(401).send('Auth token invalid')
      }
    })

    this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TwilioRenderers]
  }

  protected setupSenders() {
    return [new TypingSender(), ...TwilioSenders]
  }

  protected async map(payload: TwilioRequestBody): Promise<EndpointContent> {
    const botPhoneNumber = payload.To
    const userId = payload.From
    const text = payload.Body

    // TODO: restore index responses

    return {
      content: { type: 'text', text },
      foreignAppId: botPhoneNumber,
      foreignUserId: userId
    }
  }

  protected async context(base: ChannelContext<any>): Promise<TwilioContext> {
    return {
      ...base,
      client: this.twilio,
      messages: []
    }
  }
}
