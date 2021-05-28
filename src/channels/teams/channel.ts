import { Channel } from '../base/channel'
import { TeamsConduit } from './conduit'

export class TeamsChannel extends Channel<TeamsConduit> {
  get name() {
    return 'teams'
  }

  get id() {
    return '0491806d-ceb4-4397-8ebf-b8e6deb038da'
  }

  createConduit() {
    return new TeamsConduit()
  }

  async setupRoutes() {
    this.router.use('/', async (req, res) => {
      const conduit = res.locals.conduit as TeamsConduit

      await conduit.adapter.processActivity(req, <any>res, async (turnContext) => {
        await conduit.receive(turnContext)
      })
    })

    this.printWebhook()
  }
}
