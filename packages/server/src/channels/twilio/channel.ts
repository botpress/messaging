import clc from 'cli-color'
import express, { Request } from 'express'
import { validateRequest } from 'twilio'
import yn from 'yn'
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
    if (yn(process.env.TWILIO_TESTING)) {
      this.logger.window([clc.red('TWILIO TESTING IS ENABLED')])
    }

    this.router.use(express.urlencoded({ extended: true }))

    this.router.post(
      '/',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as TwilioConduit
        const signature = req.headers['x-twilio-signature'] as string

        if (yn(process.env.TWILIO_TESTING)) {
          await conduit.receive(req.body)
          res.sendStatus(200)
        } else if (
          validateRequest(conduit.config.authToken, signature, conduit.webhookUrl, req.body) ||
          (await this.verifyLegacy(conduit, signature, req))
        ) {
          await conduit.receive(req.body)
          res.sendStatus(204)
        } else {
          this.logger.error(new Error('Request validation failed. Make sure that your authToken is valid'))
          res.sendStatus(401)
        }
      })
    )

    this.printWebhook()
  }

  // TODO: Remove this once we deprecate old webhooks
  async verifyLegacy(instance: TwilioConduit, signature: string, req: Request) {
    const conduit = await this.app.conduits.get(instance.conduitId)
    const provider = await this.app.providers.getById(conduit!.providerId)

    const oldUrl = `${process.env.MASTER_URL}/api/v1/bots/${provider!.name}/mod/channel-twilio/webhook`

    return validateRequest(instance.config.authToken, signature, oldUrl, req.body)
  }
}
