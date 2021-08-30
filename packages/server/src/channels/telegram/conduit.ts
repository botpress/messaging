import _ from 'lodash'
import { Telegraf, Context } from 'telegraf'
import yn from 'yn'
import { EndpointContent, ConduitInstance } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { TelegramConfig } from './config'
import { TelegramContext } from './context'
import { TelegramRenderers } from './renderers'
import { TelegramSenders } from './senders'

export class TelegramConduit extends ConduitInstance<TelegramConfig, TelegramContext> {
  public callback!: (req: any, res: any) => void

  private telegraf!: Telegraf<Context>

  async initialize() {
    if (this.useWebhook()) {
      const webhook = `${await this.getRoute()}/${this.config.botToken}`
      await this.telegraf.telegram.setWebhook(webhook)
    }
  }

  async destroy() {
    await this.telegraf.stop()
  }

  protected async setupConnection() {
    this.telegraf = new Telegraf(this.config.botToken)
    this.telegraf.start(async (ctx) => {
      try {
        await this.receive(ctx)
      } catch (e) {
        this.logger.error(e, 'Error occurred on start')
      }
    })
    this.telegraf.help(async (ctx) => {
      try {
        await this.receive(ctx)
      } catch (e) {
        this.logger.error(e, 'Error occurred on help')
      }
    })
    this.telegraf.on('message', async (ctx) => {
      try {
        await this.receive(ctx)
      } catch (e) {
        this.logger.error(e, 'Error occurred processing message')
      }
    })
    this.telegraf.on('callback_query', async (ctx) => {
      try {
        await this.receive(ctx)
      } catch (e) {
        this.logger.error(e, 'Error occurred processing callback query')
      }
    })

    if (!this.useWebhook()) {
      await this.telegraf.telegram.deleteWebhook()
      this.telegraf['startPolling']()
    } else {
      this.callback = this.telegraf.webhookCallback(`/${this.config.botToken}`)
      await this.printWebhook()
    }
  }

  private useWebhook() {
    return !yn(process.env.SPINNED) || yn(process.env.CLUSTER_ENABLED)
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...TelegramRenderers]
  }

  protected setupSenders() {
    return TelegramSenders
  }

  public async extractEndpoint(payload: Context): Promise<EndpointContent> {
    const chatId = payload.chat?.id || payload.message?.chat.id
    const userId = payload.from?.id || payload.message?.from?.id

    let text = ''
    let data = ''

    if (payload.message && 'text' in payload.message) {
      text = payload.message?.text
    }

    // TODO: this logic should be handled by channel receivers
    if (payload.callbackQuery && 'data' in payload.callbackQuery) {
      data = payload.callbackQuery.data
    }

    let content
    if (!text && data) {
      if (data.startsWith('say::')) {
        content = { type: 'say_something', text: data.replace('say::', '') }
      } else if (data.startsWith('postback::')) {
        content = { type: 'postback', payload: data.replace('postback::', '') }
      }
    }

    if (!content) {
      content = { type: 'text', text }
    }

    return {
      content,
      sender: userId!.toString(),
      thread: chatId!.toString()
    }
  }

  protected async getContext(base: ChannelContext<Telegraf<Context>>): Promise<TelegramContext> {
    const context: TelegramContext = {
      ...base,
      client: this.telegraf,
      messages: []
    }

    return context
  }
}
