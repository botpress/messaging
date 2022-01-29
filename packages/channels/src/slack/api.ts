import { ReceiverEvent } from '@slack/bolt'
import express, { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { SlackService } from './service'

export class SlackApi extends ChannelApi<SlackService> {
  async setup(router: ChannelApiManager) {
    router.use('/slack', express.json())
    router.post('/slack', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    // TODO: need to handle authentication

    if (req.body?.ssl_check) {
      return res.send()
    } else if (req.body?.type === 'url_verification') {
      return res.json({ challenge: req.body.challenge })
    } else {
      const event: ReceiverEvent = {
        body: req.body,
        ack: async (response) => {
          if (!response) {
            res.send('')
          } else if (typeof response === 'string') {
            res.send(response)
          } else {
            res.json(response)
          }
        }
      }

      const { app } = this.service.get(req.scope)
      await app.processEvent(event)
    }
  }

  private async handleStart({ scope }: { scope: string }) {
    const { app } = this.service.get(scope)

    app.message(async ({ message }) => {
      await this.service.receive(
        scope,
        { identity: '*', sender: (message as any).user || '*', thread: message.channel },
        { type: 'text', text: (message as any).text }
      )
    })
  }
}
