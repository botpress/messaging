import { Channel } from '../base/channel'
import { TeamsInstance } from './instance'

export class TeamsChannel extends Channel<TeamsInstance> {
  get name() {
    return 'teams'
  }

  get id() {
    return '0491806d-ceb4-4397-8ebf-b8e6deb038da'
  }

  protected createInstance(providerId: string, clientId: string): TeamsInstance {
    return new TeamsInstance(
      this,
      providerId,
      clientId,
      this.kvs,
      this.conversations,
      this.messages,
      this.mapping,
      this.loggers
    )
  }

  async setupRoutes() {
    this.router.use('/', async (req, res) => {
      const instance = res.locals.instance as TeamsInstance

      await instance.adapter.processActivity(req, <any>res, async (turnContext) => {
        await instance.receive(turnContext)
      })
    })

    this.printWebhook()
  }
}
