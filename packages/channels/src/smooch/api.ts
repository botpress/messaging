import express, { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { SmoochService } from './service'

export const SAY_PREFIX = 'say::'
export const POSTBACK_PREFIX = 'postback::'

export class SmoochApi extends ChannelApi<SmoochService> {
  async setup(router: ChannelApiManager) {
    router.use('/smooch', express.json())
    router.post('/smooch', this.handleRequest.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const { config } = this.service.get(req.scope)

    if (req.headers['x-api-key'] === (config as any).webhookSecret) {
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
