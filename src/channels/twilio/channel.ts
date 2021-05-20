import _ from 'lodash'
import { Twilio, validateRequest } from 'twilio'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Channel } from '../base/channel'
import { Routers } from '../types'
import { TwilioConfig } from './config'
import { TwilioContext } from './context'
import { TwilioCardRenderer } from './renderers/card'
import { TwilioCarouselRenderer } from './renderers/carousel'
import { TwilioChoicesRenderer } from './renderers/choices'
import { TwilioImageRenderer } from './renderers/image'
import { TwilioTextRenderer } from './renderers/text'
import { TwilioCommonSender } from './senders/common'

export class TwilioChannel extends Channel {
  private renderers = [
    new TwilioCardRenderer(),
    new TwilioTextRenderer(),
    new TwilioImageRenderer(),
    new TwilioCarouselRenderer(),
    new TwilioChoicesRenderer()
  ]
  private senders = [new TwilioCommonSender()]

  private config!: TwilioConfig
  private kvs!: KvsService
  private conversations!: ConversationService
  private messages!: MessageService

  private twilio!: Twilio
  private webhookUrl!: string
  private botId: string = 'default'

  get id() {
    return 'twilio'
  }

  async setup(
    config: TwilioConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    routers: Routers
  ) {
    this.config = config
    this.kvs = kvsService
    this.conversations = conversationService
    this.messages = messagesService

    if (!this.config.accountSID || !this.config.authToken) {
      throw new Error('The accountSID and authToken must be configured to use this channel.')
    }

    this.twilio = new Twilio(this.config.accountSID, this.config.authToken)

    const route = '/webhooks/twilio'

    routers.full.post(route, async (req, res) => {
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

  private auth(req: any): boolean {
    const signature = req.headers['x-twilio-signature']
    return validateRequest(this.config.authToken!, signature, this.webhookUrl, req.body)
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
    console.log('twilio send webhook', message)
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
