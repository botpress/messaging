import _ from 'lodash'
import { Telegraf } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
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

  private telegraf!: Telegraf<TelegrafContext>

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
        this.logger.error(e, 'Error occured on start')
      }
    })
    this.telegraf.help(async (ctx) => {
      try {
        await this.receive(ctx)
      } catch (e) {
        this.logger.error(e, 'Error occured on help')
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
      this.telegraf.startPolling()
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

  public async extractEndpoint(payload: TelegrafContext): Promise<EndpointContent> {
    const chatId = payload.chat?.id || payload.message?.chat.id
    const userId = payload.from?.id || payload.message?.from?.id
    const text = payload.message?.text

    // TODO: this logic should be handled by channel receivers
    const data = payload.callbackQuery?.data
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

  protected async getContext(base: ChannelContext<any>): Promise<TelegramContext> {
    return {
      ...base,
      client: this.telegraf,
      messages: []
    }
  }
}
