import _ from 'lodash'
import { Twilio } from 'twilio'
import { TwilioConfig } from './config'
import { v4 as uuidv4 } from 'uuid'
import { TwilioContext } from './context'
import { ChannelRenderer } from '../base/renderer'
import { TwilioTextRenderer } from './renderers/text'
import { TwilioImageRenderer } from './renderers/image'
import { TwilioCarouselRenderer } from './renderers/carousel'
import { TwilioChoicesRenderer } from './renderers/choices'
import { ChannelSender } from '../base/sender'
import { TwilioCommonSender } from './senders/common'

export class TwilioClient {
  private twilio!: Twilio
  private renderers!: ChannelRenderer<TwilioContext>[]
  private senders!: ChannelSender<TwilioContext>[]

  constructor(private config: TwilioConfig) {}

  setup() {
    if (!this.config.accountSID || !this.config.authToken) {
      throw new Error('The accountSID and authToken must be configured to use this channel.')
    }

    this.twilio = new Twilio(this.config.accountSID, this.config.authToken)

    this.renderers = [
      new TwilioTextRenderer(),
      new TwilioImageRenderer(),
      new TwilioCarouselRenderer(),
      new TwilioChoicesRenderer()
    ]

    this.senders = [new TwilioCommonSender()]
  }

  async receive(body: TwilioRequestBody) {
    // debugIncoming('Received message', body)

    const botPhoneNumber = body.To
    const userId = body.From
    const text = body.Body

    // TODO: map conversation to user
    // const conversation = await this.bp.experimental.conversations.forBot(this.botId).recent(userId)

    // TODO: kvs service
    // await this.bp.kvs.forBot(this.botId).set(`twilio-number-${conversation.id}`, botPhoneNumber)

    // TODO: make index response work
    /*
    const index = Number(text)
    let payload: any = { type: 'text', text }
    if (index) {
      payload = (await this.handleIndexReponse(index - 1, userId, conversation.id)) ?? payload
      if (!payload.text) {
        return
      }
    }
    */

    // TODO: kvs
    // await this.kvs.delete(this.getKvsKey(userId, conversation.id))

    // TODO: post to webhook
    // await this.bp.experimental.messages.forBot(this.botId).receive(conversation.id, payload, { channel: 'twilio' })

    console.log('send webhook', {
      id: uuidv4(),
      conversationId: 'TODO',
      authorId: userId,
      sentOn: new Date(),
      payload: { type: 'text', text }
    })
  }

  async send(conversationId: string, payload: any) {
    // TODO: kvs
    // const botPhoneNumber = await this.bp.kvs.forBot(this.botId).get(`twilio-number-${event.threadId}`)

    const botPhoneNumber = this.config.botPhoneNumber!

    const context: TwilioContext = {
      client: this.twilio,
      handlers: [],
      payload: _.cloneDeep(payload),
      messages: [],
      botPhoneNumber,
      targetPhoneNumber: conversationId
      // prepareIndexResponse: this.prepareIndexResponse.bind(this)
    }

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        renderer.render(context)
        context.handlers.push(renderer.id)
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        await sender.send(context)
      }
    }
  }
}

export interface TwilioRequestBody {
  To: string
  From: string
  Body: string
}
