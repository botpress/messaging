import { ActivityTypes, TurnContext } from 'botbuilder'
import { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { POSTBACK_PREFIX, SAY_PREFIX } from './renderers/carousel'
import { QUICK_REPLY_PREFIX } from './renderers/choices'
import { TeamsService } from './service'

export class TeamsApi extends ChannelApi<TeamsService> {
  async setup(router: ChannelApiManager) {
    router.post('/teams', this.handleRequest.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const { adapter } = this.service.get(req.scope)

    try {
      await adapter.processActivity(req, res, async (turnContext) => {
        if (this.isProactive(turnContext)) {
          await this.handleProactive(req.scope, turnContext)
        } else {
          await this.handleMessage(req.scope, turnContext)
        }
      })
    } catch (e) {
      this.service.logger?.error(e, 'Error occurred processing teams activity')
    }
  }

  private async handleMessage(scope: string, turnContext: TurnContext) {
    const { activity } = turnContext
    const convoRef = TurnContext.getConversationReference(activity)

    await this.service.setRef(scope, convoRef.conversation!.id, convoRef)

    const endpoint = { identity: '*', sender: activity.from.id, thread: convoRef.conversation!.id }
    const text: string | undefined = activity.value?.text || activity.text

    if (!text) {
      return
    }

    if (text.startsWith(QUICK_REPLY_PREFIX)) {
      const [_prefix, payload, title] = text.split('::')
      await this.service.receive(scope, endpoint, { type: 'quick_reply', text: title, payload })
    } else if (text.startsWith(SAY_PREFIX)) {
      await this.service.receive(scope, endpoint, {
        type: 'say_something',
        text: text.replace(SAY_PREFIX, '')
      })
    } else if (text.startsWith(POSTBACK_PREFIX)) {
      await this.service.receive(scope, endpoint, {
        type: 'postback',
        payload: text.replace(POSTBACK_PREFIX, '')
      })
    } else {
      await this.service.receive(scope, endpoint, { type: 'text', text })
    }
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
