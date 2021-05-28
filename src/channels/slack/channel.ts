import { Channel } from '../base/channel'
import { SlackConduit } from './conduit'

export class SlackChannel extends Channel<SlackConduit> {
  get name() {
    return 'slack'
  }

  get id() {
    return 'd6111009-712d-485e-a62d-1540f966f4f3'
  }

  createConduit() {
    return new SlackConduit()
  }

  async setupRoutes() {
    this.router.use('/interactive', (req, res) => {
      const conduit = res.locals.conduit as SlackConduit
      conduit.interactiveListener(req, res)
    })
    this.printWebhook('interactive')

    this.router.use('/events', (req, res) => {
      const conduit = res.locals.conduit as SlackConduit
      conduit.eventsListener(req, res)
    })
    this.printWebhook('events')
  }
}
