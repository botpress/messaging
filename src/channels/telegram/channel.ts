import _ from 'lodash'
import { Telegraf } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Channel } from '../base/channel'
import { Routers } from '../types'
import { TelegramConfig } from './config'
import { TelegramContext } from './context'
import { TelegramCardRenderer } from './renderers/card'
import { TelegramCarouselRenderer } from './renderers/carousel'
import { TelegramChoicesRenderer } from './renderers/choices'
import { TelegramImageRenderer } from './renderers/image'
import { TelegramTextRenderer } from './renderers/text'
import { TelegramCommonSender } from './senders/common'
import { TelegramTypingSender } from './senders/typing'

export class TelegramChannel extends Channel {
  private renderers = [
    new TelegramCardRenderer(),
    new TelegramTextRenderer(),
    new TelegramImageRenderer(),
    new TelegramCarouselRenderer(),
    new TelegramChoicesRenderer()
  ]
  private senders = [new TelegramTypingSender(), new TelegramCommonSender()]

  private telegraf!: Telegraf<TelegrafContext>
  private config!: TelegramConfig
  private kvs!: KvsService
  private conversations!: ConversationService
  private messages!: MessageService

  private botId: string = 'default'

  get id() {
    return 'telegram'
  }

  async setup(
    config: TelegramConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    routers: Routers
  ) {
    this.config = config
    this.kvs = kvsService
    this.conversations = conversationService
    this.messages = messagesService

    this.telegraf = new Telegraf(<string>config.botToken)
    const route = '/webhooks/telegram'

    await this.telegraf.telegram.setWebhook(`${config.externalUrl}${route}`)
    routers.raw.use(route, this.telegraf.webhookCallback('/'))

    const webhookUrl = config.externalUrl + route
    console.log(`Telegram webhook listening at ${webhookUrl}`)

    this.telegraf.start(async (ctx) => this.receive(ctx))
    this.telegraf.help(async (ctx) => this.receive(ctx))
    this.telegraf.on('message', async (ctx) => this.receive(ctx))
    this.telegraf.on('callback_query', async (ctx) => this.receive(ctx))
  }

  async receive(ctx: TelegrafContext) {
    const userId = `${ctx.from?.id || ctx.message?.from?.id}`
    const text = ctx.message?.text || ctx.callbackQuery?.data

    const conversation = await this.conversations.forBot(this.botId).recent(userId)
    const message = await this.messages.forBot(this.botId).create(conversation.id, { type: 'text', text }, userId)
    console.log('telegram send webhook', message)
  }

  async send(conversationId: string, payload: any) {
    const conversation = await this.conversations.forBot(this.botId).get(conversationId)

    const context: TelegramContext = {
      client: this.telegraf,
      handlers: [],
      payload: _.cloneDeep(payload),
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/',
      messages: [],
      // TODO: mapping
      chatId: conversation?.userId!
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
