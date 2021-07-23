import express from 'express'
import { validateRequest } from 'twilio'
import { Channel } from '../base/channel'
import { TwilioConduit } from './conduit'
import { TwilioConfigSchema } from './config'

export class TwilioChannel extends Channel<TwilioConduit> {
  get name() {
    return 'twilio'
  }

  get id() {
    return '330ca935-6441-4159-8969-d0a0d3f188a1'
  }

  get schema() {
    return TwilioConfigSchema
  }

  createConduit() {
    return new TwilioConduit()
  }

  async setupRoutes() {
    this.router.use(express.urlencoded({ extended: true }))

    this.router.use(
      '/',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as TwilioConduit
        const signature = req.headers['x-twilio-signature'] as string
        // TODO: Remove this once we deprecate the old webhooks
        const oldWebhook = `https://${req.headers.host}${req.url}`
        if (
          validateRequest(conduit.config.authToken, signature, conduit.webhookUrl, req.body) ||
          validateRequest(conduit.config.authToken, signature, oldWebhook, req.body)
        ) {
          await this.app.instances.receive(conduit.conduitId, req.body)
          res.sendStatus(204)
        } else {
          this.logger.error('Request validation failed. Make sure that your authToken is valid.')

          res.status(401).send('Auth token invalid')
        }
      })
    )

    this.printWebhook()
  }
}
