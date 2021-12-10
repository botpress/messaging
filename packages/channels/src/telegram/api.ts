import { Response } from 'express'
import { TelegrafContext } from 'telegraf/typings/context'
import yn from 'yn'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ChannelInitializeEvent } from '../base/service'
import { TelegramService } from './service'

export class TelegramApi extends ChannelApi<TelegramService> {
  async setup(router: ChannelApiManager) {
    // TODO: make it optional to include the name of the channel
    router.post('/telegram/:token', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
    this.service.on('initialize', this.handleInitialize.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    // This is done to make forwarding work
    req.url = `/${req.params.token}`

    const state = this.service.get(req.scope)

    if (req.params.token === state.config.botToken) {
      state.callback!(req, res)
    } else {
      res.sendStatus(401)
    }
  }

  protected async handleInitialize({ scope }: ChannelInitializeEvent) {
    if (this.useWebhook()) {
      const { telegraf, config } = this.service.get(scope)
      const webhook = `${await this.urlCallback!(scope)}/${config.botToken}`
      await telegraf.telegram.setWebhook(webhook)
    }
  }

  private async handleStart({ scope }: { scope: string }) {
    const { config, telegraf } = this.service.get(scope)

    telegraf.start(async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        this.service.logger?.error(e, 'Error occured on start')
      }
    })
    telegraf.help(async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        this.service.logger?.error(e, 'Error occured on help')
      }
    })
    telegraf.on('message', async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        this.service.logger?.error(e, 'Error occurred processing message')
      }
    })
    telegraf.on('callback_query', async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        this.service.logger?.error(e, 'Error occurred processing callback query')
      }
    })

    if (!this.useWebhook()) {
      await telegraf.telegram.deleteWebhook()
      telegraf.startPolling()
    } else {
      const callback = telegraf.webhookCallback(`/${config.botToken}`)
      this.service.get(scope).callback = callback
      await this.printWebhook(scope, 'telegram')
    }
  }

  private useWebhook() {
    // TODO: remove this dependency on server env vars
    return !yn(process.env.SPINNED) || yn(process.env.CLUSTER_ENABLED)
  }

  private async receive(scope: string, ctx: TelegrafContext) {
    const chatId = ctx.chat?.id || ctx.message?.chat.id
    const userId = ctx.from?.id || ctx.message?.from?.id
    const text = ctx.message?.text

    // TODO: this logic should be handled by channel receivers
    const data = ctx.callbackQuery?.data
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

    await this.service.receive(
      scope,
      { identity: '*', sender: userId!.toString(), thread: chatId!.toString() },
      content
    )
  }
}
