import _ from 'lodash'
import { Twilio, validateRequest } from 'twilio'
import { Channel } from '../base/channel'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TwilioConfig } from './config'
import { TwilioContext, TwilioRequestBody } from './context'
import { TwilioRenderers } from './renderers'
import { TwilioSenders } from './senders'

export class TwilioChannel extends Channel<TwilioConfig, TwilioContext> {
  get id() {
    return 'twilio'
  }

  private twilio!: Twilio
  private webhookUrl!: string

  protected async setupConnection() {
    if (!this.config.accountSID || !this.config.authToken) {
      throw new Error('The accountSID and authToken must be configured to use this channel.')
    }

    this.twilio = new Twilio(this.config.accountSID, this.config.authToken)

    const route = '/webhooks/twilio'

    this.routers.full.post(route, async (req, res) => {
      if (this.auth(req)) {
        await this.receive(req.body)
        res.sendStatus(204)
      } else {
        res.status(401).send('Auth token invalid')
      }
    })

    this.webhookUrl = this.config.externalUrl + route

    console.log(`Twilio webhook listening at ${this.webhookUrl}`)
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TwilioRenderers]
  }

  protected setupSenders() {
    return TwilioSenders
  }

  protected map(payload: TwilioRequestBody) {
    const botPhoneNumber = payload.To
    const userId = payload.From
    const text = payload.Body

    // TODO: restore index responses

    return {
      content: { type: 'text', text },
      userId
    }
  }

  async send(conversationId: string, payload: any) {
    // TODO: scope per bot
    const { botPhoneNumber } = await this.kvs.get(`twilio-number-${conversationId}`)

    const conversation = await this.conversations.forBot(this.botId).get(conversationId)

    const context: TwilioContext = {
      client: this.twilio,
      handlers: [],
      payload: _.cloneDeep(payload),
      messages: [],
      botPhoneNumber,
      targetPhoneNumber: conversation!.userId,
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/'
      // prepareIndexResponse: this.prepareIndexResponse.bind(this)
    }

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        renderer.render(context)
        // TODO: do we need ids?
        context.handlers.push('id')
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        await sender.send(context)
      }
    }
  }

  private auth(req: any): boolean {
    const signature = req.headers['x-twilio-signature']
    return validateRequest(this.config.authToken!, signature, this.webhookUrl, req.body)
  }
}
