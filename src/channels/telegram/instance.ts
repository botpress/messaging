import _ from 'lodash'
import { Telegraf } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { ChannelContext } from '../base/context'
import { EndpointContent, Instance } from '../base/instance'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TelegramConfig } from './config'
import { TelegramContext } from './context'
import { TelegramRenderers } from './renderers'
import { TelegramSenders } from './senders'

export class TelegramInstance extends Instance<TelegramConfig, TelegramContext> {
  get id() {
    return 'telegram'
  }

  private telegraf!: Telegraf<TelegrafContext>

  protected async setupConnection() {
    this.telegraf = new Telegraf(<string>this.config.botToken)
    this.telegraf.start(async (ctx) => this.receive(ctx))
    this.telegraf.help(async (ctx) => this.receive(ctx))
    this.telegraf.on('message', async (ctx) => this.receive(ctx))
    this.telegraf.on('callback_query', async (ctx) => this.receive(ctx))

    this.router.use('/', this.telegraf.webhookCallback('/'))
    await this.telegraf.telegram.setWebhook(this.config.externalUrl + this.route())

    this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TelegramRenderers]
  }

  protected setupSenders() {
    return TelegramSenders
  }

  protected async map(payload: TelegrafContext): Promise<EndpointContent> {
    const chatId = payload.chat?.id || payload.message?.chat.id
    const userId = payload.from?.id || payload.message?.from?.id
    const text = payload.message?.text || payload.callbackQuery?.data

    return {
      content: { type: 'text', text },
      foreignUserId: userId!.toString(),
      foreignConversationId: chatId!.toString()
    }
  }

  protected async context(base: ChannelContext<any>): Promise<TelegramContext> {
    return {
      ...base,
      client: this.telegraf,
      messages: []
    }
  }
}
