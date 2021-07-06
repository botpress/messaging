import { Channel } from '../base/channel'
import { WebConduit } from './conduit'

export class WebChannel extends Channel<WebConduit> {
  get name() {
    return 'web'
  }

  get id() {
    return 'd9063ab0-e715-4cd4-83b4-184346175b2c'
  }

  createConduit() {
    return new WebConduit()
  }

  async setupRoutes() {
    // TODO: does this make sense?
    this.router.post(
      '/',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as WebConduit

        // TODO: validation
        await conduit.receive(req.body)

        res.sendStatus(200)
      })
    )

    this.printWebhook()
  }
}
