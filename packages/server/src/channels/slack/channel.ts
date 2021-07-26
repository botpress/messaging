import { Channel } from '../base/channel'
import { SlackConduit } from './conduit'
import { SlackConfigSchema } from './config'

export class SlackChannel extends Channel<SlackConduit> {
  get name() {
    return 'slack'
  }

  get id() {
    return 'd6111009-712d-485e-a62d-1540f966f4f3'
  }

  get schema() {
    return SlackConfigSchema
  }

  createConduit() {
    return new SlackConduit()
  }

  async setupRoutes() {
    this.router.post(
      '/interactive',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as SlackConduit
        conduit.handleInteractiveRequest(req, res)
      })
    )
    this.printWebhook('interactive')

    this.router.post(
      '/events',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as SlackConduit
        conduit.handleEventRequest(req, res)
      })
    )
    this.printWebhook('events')
  }
}
