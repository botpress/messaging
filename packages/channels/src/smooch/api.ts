import express, { Response } from 'express'
import yn from 'yn'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ChannelInitializeEvent, ChannelStartEvent } from '../base/service'
import { SmoochService } from './service'

export const SAY_PREFIX = 'say::'
export const POSTBACK_PREFIX = 'postback::'

export class SmoochApi extends ChannelApi<SmoochService> {
  async setup(router: ChannelApiManager) {
    router.use('/smooch', express.json())
    router.post('/smooch', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
    this.service.on('initialize', this.handleInitialize.bind(this))
  }

  protected async handleStart({ scope }: ChannelStartEvent) {
    const state = this.service.get(scope)

    const { webhooks } = await state.smooch.webhooks.list()
    const target = await this.urlCallback!(scope)
    const webhook = webhooks.find((x: any) => x.target === target)

    state.webhookSecret = webhook?.secret
  }

  protected async handleInitialize({ scope }: ChannelInitializeEvent) {
    const state = this.service.get(scope)
    const target = await this.urlCallback!(scope)
    const { webhooks } = await state.smooch.webhooks.list()

    // Remove this dependency on the server's env vars
    if (yn(process.env.SPINNED)) {
      const legacyWh = webhooks.find((x: any) => x.target?.includes('/mod/channel-smooch'))
      if (legacyWh) {
        await state.smooch.webhooks.delete(legacyWh._id)
        console.info('Deleted legacy webhook', legacyWh.target)
      }
    }

    let webhook = webhooks.find((x: any) => x.target === target)
    if (!webhook) {
      webhook = (
        await state.smooch.webhooks.create({
          target,
          triggers: ['message:appUser', 'postback']
        })
      ).webhook
    }

    state.webhookSecret = webhook.secret
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const { webhookSecret } = this.service.get(req.scope)

    if (webhookSecret?.length && req.headers['x-api-key'] === webhookSecret) {
      const body = req.body

      // postbacks is used when a button is clicked
      for (const message of body.messages || body.postbacks) {
        const postback = message.action?.payload
        let content

        if (postback?.startsWith(SAY_PREFIX)) {
          content = { type: 'say_something', text: postback.replace(SAY_PREFIX, '') }
        } else if (postback?.startsWith(POSTBACK_PREFIX)) {
          content = { type: 'postback', payload: postback.replace(POSTBACK_PREFIX, '') }
        } else {
          content = { type: 'text', text: message.text }
        }

        await this.service.receive(
          req.scope,
          { identity: '*', sender: body.appUser._id, thread: body.conversation._id },
          content
        )
      }
      res.sendStatus(200)
    } else {
      res.sendStatus(401)
    }
  }
}
