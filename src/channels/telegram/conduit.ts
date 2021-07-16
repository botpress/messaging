import _ from 'lodash'
import { Telegraf } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import { EndpointContent, ConduitInstance } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TelegramConfig } from './config'
import { TelegramContext } from './context'
import { TelegramRenderers } from './renderers'
import { TelegramSenders } from './senders'

export class TelegramConduit extends ConduitInstance<TelegramConfig, TelegramContext> {
  private telegraf!: Telegraf<TelegrafContext>
  public callback!: (req: any, res: any) => void

  async initialize() {
    await this.telegraf.telegram.setWebhook(this.config.webhookUrl || (await this.getRoute()))
  }

  protected async setupConnection() {
    this.telegraf = new Telegraf(this.config.botToken)
    this.telegraf.start(async (ctx) => this.app.instances.receive(this.conduitId, ctx))
    this.telegraf.help(async (ctx) => this.app.instances.receive(this.conduitId, ctx))
    this.telegraf.on('message', async (ctx) => this.app.instances.receive(this.conduitId, ctx))
    this.telegraf.on('callback_query', async (ctx) => this.app.instances.receive(this.conduitId, ctx))

    // TODO: THIS ISN'T SAFE. Telegram doesn't verify incoming requests
    // using the botToken, but instead verifies that the request path is correct.
    // This means that the webhook path must contain a secret (can't be just '/').
    this.callback = this.telegraf.webhookCallback('/')

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TelegramRenderers]
  }

  protected setupSenders() {
    return TelegramSenders
  }

  public async extractEndpoint(payload: TelegrafContext): Promise<EndpointContent> {
    const chatId = payload.chat?.id || payload.message?.chat.id
    const userId = payload.from?.id || payload.message?.from?.id
    const text = payload.message?.text || payload.callbackQuery?.data

    return {
      content: { type: 'text', text },
      sender: userId!.toString(),
      thread: chatId!.toString()
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
