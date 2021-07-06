import express from 'express'
import { Channel } from '../base/channel'
import { SmoochConduit } from './conduit'
import { SmoochPayload } from './context'

export class SmoochChannel extends Channel<SmoochConduit> {
  get name() {
    return 'smooch'
  }

  get id() {
    return '3c5c160f-d673-4ef8-8b6f-75448af048ce'
  }

  createConduit() {
    return new SmoochConduit()
  }

  async setupRoutes() {
    this.router.use(express.json())

    this.router.post(
      '/',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as SmoochConduit

        if (req.headers['x-api-key'] === conduit.config.webhookSecret) {
          const body = req.body as SmoochPayload
          for (const message of body.messages) {
            await this.app.instances.receive(conduit.conduitId, { context: body, message })
          }
          res.sendStatus(200)
        } else {
          res.status(401).send('Auth token invalid')
        }
      })
    )

    this.printWebhook()
  }
}
