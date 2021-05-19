import _ from 'lodash'
import { Twilio } from 'twilio'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { ChannelRenderer } from '../base/renderer'
import { ChannelSender } from '../base/sender'
import { TwilioConfig } from './config'
import { TwilioContext } from './context'
import { TwilioCardRenderer } from './renderers/card'
import { TwilioCarouselRenderer } from './renderers/carousel'
import { TwilioChoicesRenderer } from './renderers/choices'
import { TwilioImageRenderer } from './renderers/image'
import { TwilioTextRenderer } from './renderers/text'
import { TwilioCommonSender } from './senders/common'

export class TwilioClient {
  private twilio!: Twilio
  private renderers!: ChannelRenderer<TwilioContext>[]
  private senders!: ChannelSender<TwilioContext>[]

  private botId: string = 'default'

  constructor(
    private config: TwilioConfig,
    private kvs: KvsService,
    private conversations: ConversationService,
    private messages: MessageService
  ) {}

  setup() {
    if (!this.config.accountSID || !this.config.authToken) {
      throw new Error('The accountSID and authToken must be configured to use this channel.')
    }

    this.twilio = new Twilio(this.config.accountSID, this.config.authToken)

    this.renderers = [
      new TwilioCardRenderer(),
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
    const conversation = await this.conversations.forBot(this.botId).recent(userId)

    // TODO: scope per bot
    await this.kvs.set(`twilio-number-${conversation.id}`, { botPhoneNumber })

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

    const message = await this.messages.forBot(this.botId).create(conversation.id, { type: 'text', text }, userId)
    console.log('send webhook', message)
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
}

export interface TwilioRequestBody {
  To: string
  From: string
  Body: string
}
