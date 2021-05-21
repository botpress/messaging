import _ from 'lodash'
import { Telegraf } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { Conversation } from '../../conversations/types'
import { Channel } from '../base/channel'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TelegramConfig } from './config'
import { TelegramContext } from './context'
import { TelegramRenderers } from './renderers'
import { TelegramSenders } from './senders'

export class TelegramChannel extends Channel<TelegramConfig, TelegramContext> {
  get id() {
    return 'telegram'
  }

  private telegraf!: Telegraf<TelegrafContext>

  protected async setupConnection() {
    this.telegraf = new Telegraf(<string>this.config.botToken)
    const webhookUrl = this.config.externalUrl + this.route()

    await this.telegraf.telegram.setWebhook(webhookUrl)
    this.router.use('/', this.telegraf.webhookCallback('/'))

    console.log(`Telegram webhook listening at ${webhookUrl}`)

    this.telegraf.start(async (ctx) => this.receive(ctx))
    this.telegraf.help(async (ctx) => this.receive(ctx))
    this.telegraf.on('message', async (ctx) => this.receive(ctx))
    // TODO: Postback works but say something doesn't
    this.telegraf.on('callback_query', async (ctx) => this.receive(ctx))
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TelegramRenderers]
  }

  protected setupSenders() {
    return TelegramSenders
  }

  protected map(payload: TelegrafContext) {
    const userId = payload.from?.id || payload.message?.from?.id
    const text = payload.message?.text || payload.callbackQuery?.data

    return {
      content: { type: 'text', text },
      userId: userId!.toString()
    }
  }

  protected async context(conversation: Conversation) {
    return {
      client: this.telegraf,
      messages: [],
      // TODO: mapping
      chatId: conversation.userId
    }
  }
}
