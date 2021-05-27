import express from 'express'
import { Channel } from '../base/channel'
import { SmoochPayload } from './context'
import { SmoochInstance } from './instance'

export class SmoochChannel extends Channel<SmoochInstance> {
  get name() {
    return 'smooch'
  }

  get id() {
    return '3c5c160f-d673-4ef8-8b6f-75448af048ce'
  }

  protected createInstance(providerId: string, clientId: string): SmoochInstance {
    return new SmoochInstance(
      this,
      providerId,
      clientId,
      this.kvs,
      this.conversations,
      this.messages,
      this.mapping,
      this.loggers
    )
  }

  async setupRoutes() {
    this.router.use(express.json())

    this.router.post('/', async (req, res) => {
      const instance = res.locals.instance as SmoochInstance

      if (req.headers['x-api-key'] === instance.config.webhookSecret) {
        const body = req.body as SmoochPayload
        for (const message of body.messages) {
          await instance.receive({ context: body, message })
        }
        res.sendStatus(200)
      } else {
        res.status(401).send('Auth token invalid')
      }
    })

    this.printWebhook()
  }
}
