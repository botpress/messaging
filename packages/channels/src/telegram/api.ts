import { Response } from 'express'
import { TelegrafContext } from 'telegraf/typings/context'
import { ChannelApiManager, ChannelApiRequest } from '../base/api'
import { TelegramService } from './service'

export class TelegramApi {
  constructor(private readonly service: TelegramService) {}

  async setup(router: ChannelApiManager) {
    router.post('/:token', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    // This is done to make forwarding work
    req.url = `/${req.params.token}`

    const state = this.service.get(req.scope)

    if (req.params.token === state.config.botToken) {
      state.callback(req, res)
    } else {
      res.sendStatus(401)
    }
  }

  private async handleStart({ scope }: { scope: string }) {
    const { telegraf } = this.service.get(scope)

    telegraf.start(async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        console.error('Error occured on start', e)
      }
    })
    telegraf.help(async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        console.error('Error occured on help', e)
      }
    })
    telegraf.on('message', async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        console.error('Error occurred processing message', e)
      }
    })
    telegraf.on('callback_query', async (ctx) => {
      try {
        await this.receive(scope, ctx)
      } catch (e) {
        console.error('Error occurred processing callback query', e)
      }
    })
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
