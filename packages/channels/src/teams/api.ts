import { ActivityTypes, TurnContext } from 'botbuilder'
import { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { TeamsService } from './service'

export class TeamsApi extends ChannelApi<TeamsService> {
  async setup(router: ChannelApiManager) {
    router.post('/teams', this.handleRequest.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const { adapter } = this.service.get(req.scope)

    await adapter.processActivity(req, res, async (turnContext) => {
      try {
        if (this.isProactive(turnContext)) {
          await this.handleProactive(req.scope, turnContext)
        } else {
          await this.handleMessage(req.scope, turnContext)
        }
      } catch (e) {
        this.service.logger?.error(e, 'Error occurred processing teams activity')
      }
    })
  }

  private async handleMessage(scope: string, turnContext: TurnContext) {
    const { activity } = turnContext
    const convoRef = TurnContext.getConversationReference(activity)

    await this.service.setRef(scope, convoRef.conversation!.id, convoRef)
    await this.service.receive(
      scope,
      { identity: '*', sender: activity.from.id, thread: convoRef.conversation!.id },
      { type: 'text', text: activity.value?.text || activity.text }
    )
  }

  private isProactive(turnContext: TurnContext): boolean {
    const { activity } = turnContext

    return (
      activity.type === ActivityTypes.ConversationUpdate &&
      (activity.membersAdded || []).some((member) => member.id === activity.recipient.id)
    )
  }

  private async handleProactive(scope: string, turnContext: TurnContext): Promise<void> {
    const { activity } = turnContext
    const convoRef = TurnContext.getConversationReference(activity)

    await this.service.setRef(scope, convoRef.conversation!.id, convoRef)
    await this.service.proactive(scope, { identity: '*', sender: activity.from.id, thread: convoRef.conversation!.id })
  }
}
