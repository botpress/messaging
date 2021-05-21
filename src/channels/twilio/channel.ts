import _ from 'lodash'
import { Twilio, validateRequest } from 'twilio'
import { Conversation } from '../../conversations/types'
import { Message } from '../../messages/types'
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
      const signature = req.headers['x-twilio-signature'] as string
      if (validateRequest(this.config.authToken!, signature, this.webhookUrl, req.body)) {
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

  protected async afterReceive(payload: TwilioRequestBody, conversation: Conversation, message: Message) {
    // TODO: scope per bot
    await this.kvs.set(`twilio-number-${conversation.id}`, { botPhoneNumber: payload.To })
  }

  protected async context(conversation: Conversation) {
    // TODO: scope per bot
    const { botPhoneNumber } = await this.kvs.get(`twilio-number-${conversation.id}`)

    return {
      client: this.twilio,
      messages: [],
      botPhoneNumber,
      targetPhoneNumber: conversation.userId
    }
  }
}
