import { ActivityTypes, TurnContext } from 'botbuilder'
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

    try {
      await adapter.processActivity(req, res, async (turnContext) => {
        if (this.botNewlyAddedToConversation(turnContext)) {
          await this.sendProactiveMessage(req.scope, turnContext)
        } else {
          await this.receive(req.scope, turnContext)
        }
      })
    } catch (e) {
      this.service.logger?.error(e, 'Error occurred processing teams activity')
    }
  }

  private async receive(scope: string, turnContext: TurnContext) {
    const { activity } = turnContext
    const convoRef = TurnContext.getConversationReference(activity)

    await this.service.setRef(scope, convoRef.conversation!.id, convoRef)
    await this.service.receive(
      scope,
      { identity: '*', sender: activity.from.id, thread: convoRef.conversation!.id },
      { type: 'text', text: activity.value?.text || activity.text }
    )
  }

  private botNewlyAddedToConversation(turnContext: TurnContext): boolean {
    const { activity } = turnContext

    // https://docs.microsoft.com/en-us/previous-versions/azure/bot-service/dotnet/bot-builder-dotnet-activities?view=azure-bot-service-3.0#conversationupdate
    return (
      activity.type === ActivityTypes.ConversationUpdate &&
      (activity.membersAdded || []).some((member) => member.id === activity.recipient.id)
    )
  }

  private async sendProactiveMessage(scope: string, turnContext: TurnContext): Promise<void> {
    const { activity } = turnContext
    const convoRef = TurnContext.getConversationReference(activity)

    const { config } = this.service.get(scope)
    await this.service.setRef(scope, convoRef.conversation!.id, convoRef)

    // Locale format: {lang}-{subtag1}-{subtag2}-... https://en.wikipedia.org/wiki/IETF_language_tag
    // TODO: Use Intl.Locale().language once its types are part of TS. See: https://github.com/microsoft/TypeScript/issues/37326
    const lang = activity.locale?.split('-')[0]
    const proactiveMessages = config.proactiveMessages || {}
    const message = lang && proactiveMessages[lang]
    const endpoint = { identity: '*', sender: activity.from.id, thread: convoRef.conversation!.id }

    if (message) {
      await this.service.send(scope, endpoint, message)
    }

    await this.service.proactive(scope, endpoint)
  }
}
