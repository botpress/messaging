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
      '/',
      this.asyncMiddleware(async (req, res) => {
        // This is done to make forwarding work
        req.url = '/'

        const conduit = res.locals.conduit as TelegramConduit
        conduit.callback(req, res)
      })
    )

    this.printWebhook()
  }
}
