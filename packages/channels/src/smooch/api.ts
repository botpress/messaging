import express, { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { POSTBACK_PREFIX, SAY_PREFIX } from './renderers/carousel'
import { SmoochService } from './service'
import { SmoochEvent, SmoochMessageEvent, SmoochPostbackEvent, SmoochRequestBody } from './smooch'

export class SmoochApi extends ChannelApi<SmoochService> {
  async setup(router: ChannelApiManager) {
    router.use('/smooch', express.json())
    router.post('/smooch', this.handleRequest.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const apiKey = req.headers['x-api-key'] as string | undefined
    const { config } = this.service.get(req.scope)

    if (apiKey !== config.webhookSecret) {
      return res.sendStatus(403)
    }

    const body = req.body as SmoochRequestBody

    for (const event of body.events) {
      await this.handleEvent(req.scope, event)
    }

    res.sendStatus(200)
  }

  private async handleEvent(scope: string, event: SmoochEvent) {
    if (event.type === 'conversation:message') {
      return this.handleMessage(scope, event)
    } else if (event.type === 'conversation:postback') {
      return this.handlePostback(scope, event)
    }
  }

  private async handleMessage(scope: string, event: SmoochMessageEvent) {
    const { conversation, message } = event.payload

    if (message.author.type === 'business') {
      return
    }

    await this.service.receive(
      scope,
      { identity: '*', sender: message.author.userId, thread: conversation.id },
      { type: 'text', text: message.content.text }
    )
  }

  private async handlePostback(scope: string, event: SmoochPostbackEvent) {
    const { conversation, postback, user } = event.payload
    const { payload } = postback

    const endpoint = { identity: '*', sender: user.id, thread: conversation.id }

    if (payload.startsWith(POSTBACK_PREFIX)) {
      await this.service.receive(scope, endpoint, {
        type: 'postback',
        payload: payload.replace(POSTBACK_PREFIX, '')
      })
    } else if (payload.startsWith(SAY_PREFIX)) {
      await this.service.receive(scope, endpoint, {
        type: 'say_something',
        text: payload.replace(SAY_PREFIX, '')
      })
    }
  }
}
