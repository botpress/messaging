import express, { Request } from 'express'
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

    this.router.post(
      '/',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as TwilioConduit
        const signature = req.headers['x-twilio-signature'] as string

        if (
          validateRequest(conduit.config.authToken, signature, conduit.webhookUrl, req.body) ||
          (await this.verifyLegacy(conduit, signature, req))
        ) {
          await this.app.instances.receive(conduit.conduitId, req.body)
          res.sendStatus(204)
        } else {
          // Maybe throw a exception here. Or just do new Error() and log that?
          this.logger.error(undefined, 'Request validation failed. Make sure that your authToken is valid')

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

    const oldUrl = `${req.headers['x-bp-host']}/api/v1/bots/${provider!.name}/mod/channel-twilio/webhook`

    return validateRequest(instance.config.authToken, signature, oldUrl, req.body)
  }
}
