import { TurnContext } from 'botbuilder'
import { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { ChannelStartEvent } from '../base/service'
import { TeamsService } from './service'

export class TeamsApi extends ChannelApi<TeamsService> {
  async setup(router: ChannelApiManager) {
    router.post('/teams', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  protected async handleStart({ scope }: ChannelStartEvent) {
    await this.printWebhook(scope, 'teams')
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const { adapter } = this.service.get(req.scope)

    await adapter.processActivity(req, res, async (turnContext) => {
      try {
        const activity = turnContext.activity
        const convoRef = TurnContext.getConversationReference(activity)

        await this.service.setRef(convoRef.conversation!.id, convoRef)
        await this.service.receive(
          req.scope,
          { identity: '*', sender: activity.from.id, thread: convoRef.conversation!.id },
          { type: 'text', text: activity.value?.text || activity.text }
        )
      } catch (e) {
        this.service.logger?.error(e, 'Error occurred processing teams activity')
      }
    })
  }
}
