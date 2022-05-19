import { Response } from 'express'
import { Context, NarrowedContext } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import yn from 'yn'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ChannelInitializeEvent, ChannelStartEvent, ChannelStopEvent } from '../base/service'
import { POSTBACK_PREFIX, SAY_PREFIX } from './renderers/carousel'
import { TelegramService } from './service'

export class TelegramApi extends ChannelApi<TelegramService> {
  async setup(router: ChannelApiManager) {
    router.post('/telegram/:token', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
    this.service.on('initialize', this.handleInitialize.bind(this))
    this.service.on('stop', this.handleStop.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const { config, callback } = this.service.get(req.scope)

    if (req.params.token === config.botToken) {
      req.url = '/' // by-passes verification in telegraf since we do it here instead
      callback!(req, res)
    } else {
      res.sendStatus(401)
    }
  }

  private async handleInitialize({ scope }: ChannelInitializeEvent) {
    if (this.useWebhook()) {
      const { telegraf, config } = this.service.get(scope)
      const webhook = `${await this.urlCallback!(scope)}/${config.botToken}`
      await telegraf.telegram.setWebhook(webhook)
    }
  }

  private async handleStart({ scope }: ChannelStartEvent) {
    const { telegraf } = this.service.get(scope)

    telegraf.on('message', this.asyncCallback(scope, this.handleTelegrafMessage.bind(this)))
    telegraf.on('callback_query', this.asyncCallback(scope, this.handleTelegrafCallbackQuery.bind(this)))

    if (this.useWebhook()) {
      this.service.get(scope).callback = telegraf.webhookCallback('/')
    } else {
      await telegraf.telegram.deleteWebhook()
      await telegraf.launch()
    }
  }

  private async handleStop({ scope }: ChannelStopEvent) {
    if (!this.useWebhook()) {
      this.service.get(scope).telegraf.stop()
    }
  }

  private async handleTelegrafMessage(scope: string, ctx: NarrowedContext<Context<Update>, Update.MessageUpdate>) {
    if ('text' in ctx.message) {
      await this.service.receive(scope, this.extractEndpoint(ctx), { type: 'text', text: ctx.message.text })
    }
  }

  private async handleTelegrafCallbackQuery(
    scope: string,
    ctx: NarrowedContext<Context<Update>, Update.CallbackQueryUpdate>
  ) {
    if ('data' in ctx.callbackQuery) {
      const data = ctx.callbackQuery.data

      if (data?.startsWith(SAY_PREFIX)) {
        await this.service.receive(scope, this.extractEndpoint(ctx), {
          type: 'say_something',
          text: data.replace(SAY_PREFIX, '')
        })
      } else if (data?.startsWith(POSTBACK_PREFIX)) {
        await this.service.receive(scope, this.extractEndpoint(ctx), {
          type: 'postback',
          payload: data?.replace(POSTBACK_PREFIX, '')
        })
      }
    }

    await ctx.answerCbQuery()
  }

  private extractEndpoint(ctx: Context) {
    const chatId = ctx.chat?.id
    const userId = ctx.from?.id

    return { identity: '*', sender: userId!.toString(), thread: chatId!.toString() }
  }

  private asyncCallback(scope: string, fn: (scope: string, ctx: any) => Promise<void>) {
    return (ctx: any) => {
      fn(scope, ctx).catch((e) => {
        this.service.logger?.error('Error occurred in telegram callback', e)
      })
    }
  }

  private useWebhook() {
    // TODO: remove this dependency on server env vars
    return !yn(process.env.SPINNED) || yn(process.env.CLUSTER_ENABLED)
  }
}
