import express, { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { SmoochService } from './service'
import { SmoochEvent } from './smooch'

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

    for (const event of req.body.events) {
      await this.handleEvent(req.scope, event)
    }

    res.sendStatus(200)
  }

  private async handleEvent(scope: string, event: SmoochEvent) {
    if (event.type === 'conversation:message') {
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
  }
}
