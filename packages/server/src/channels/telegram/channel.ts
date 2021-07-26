import { Request } from 'express'
import { Channel } from '../base/channel'
import { TelegramConduit } from './conduit'
import { TelegramConfigSchema } from './config'

export class TelegramChannel extends Channel<TelegramConduit> {
  get name() {
    return 'telegram'
  }

  get id() {
    return '0198f4f5-6100-4549-92e5-da6cc31b4ad1'
  }

  get schema() {
    return TelegramConfigSchema
  }

  get initiable() {
    return true
  }

  createConduit() {
    return new TelegramConduit()
  }

  async setupRoutes() {
    this.router.use(
      '/:token',
      this.asyncMiddleware(async (req, res) => {
        // This is done to make forwarding work
        req.url = `/${req.params.token}`

        const conduit = res.locals.conduit as TelegramConduit
        if (req.params.token === conduit.config.botToken) {
          conduit.callback(req, res)
        } else {
          res.sendStatus(401)
        }
      })
    )

    this.printWebhook()
  }
}
