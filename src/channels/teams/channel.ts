import { Channel } from '../base/channel'
import { TeamsConduit } from './conduit'
import { TeamsConfigSchema } from './config'

export class TeamsChannel extends Channel<TeamsConduit> {
  get name() {
    return 'teams'
  }

  get id() {
    return '0491806d-ceb4-4397-8ebf-b8e6deb038da'
  }

  get schema() {
    return TeamsConfigSchema
  }

  createConduit() {
    return new TeamsConduit()
  }

  async setupRoutes() {
    this.router.use(
      '/',
      this.asyncMiddleware(async (req, res) => {
        const conduit = res.locals.conduit as TeamsConduit

        await conduit.adapter.processActivity(req, <any>res, async (turnContext) => {
          if (conduit.botNewlyAddedToConversation(turnContext)) {
            await conduit.sendProactiveMessage(turnContext)
          } else {
            await this.app.instances.receive(conduit.conduitId, turnContext)
          }
        })
      })
    )

    this.printWebhook()
  }
}
