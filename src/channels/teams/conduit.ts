import { ActivityTypes, BotFrameworkAdapter, ConversationReference, TurnContext } from 'botbuilder'
import LRU from 'lru-cache'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TeamsConfig } from './config'
import { TeamsContext } from './context'
import { TeamsRenderers } from './renderers'
import { TeamsSenders } from './senders'

export class TeamsConduit extends ConduitInstance<TeamsConfig, TeamsContext> {
  public adapter!: BotFrameworkAdapter
  private convoRefs!: LRU<string, Partial<ConversationReference>>

  protected async setupConnection() {
    this.adapter = new BotFrameworkAdapter({
      appId: this.config.appId,
      appPassword: this.config.appPassword,
      channelAuthTenant: this.config.tenantId
    })

    this.convoRefs = this.app.caching.newLRU()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TeamsRenderers]
  }

  protected setupSenders() {
    return TeamsSenders
  }

  public async extractEndpoint(payload: TurnContext): Promise<EndpointContent> {
    const { activity } = payload
    const convoRef = TurnContext.getConversationReference(activity)

    await this.setConvoRef(convoRef.conversation!.id, convoRef)

    return {
      content: { type: 'text', text: activity.value?.text || activity.text },
      sender: activity.from.id,
      thread: convoRef.conversation!.id
    }
  }

  public botNewlyAddedToConversation(turnContext: TurnContext): boolean {
    const { activity } = turnContext

    // https://docs.microsoft.com/en-us/previous-versions/azure/bot-service/dotnet/bot-builder-dotnet-activities?view=azure-bot-service-3.0#conversationupdate
    return (
      activity.type === ActivityTypes.ConversationUpdate &&
      (activity.membersAdded || []).some((member) => member.id === activity.recipient.id)
    )
  }

  public async sendProactiveMessage(turnContext: TurnContext): Promise<void> {
    const { activity } = turnContext
    const convoRef = TurnContext.getConversationReference(activity)

    await this.setConvoRef(convoRef.conversation!.id, convoRef)

    // Locale format: {lang}-{subtag1}-{subtag2}-... https://en.wikipedia.org/wiki/IETF_language_tag
    // TODO: Use Intl.Locale().language once its types are part of TS. See: https://github.com/microsoft/TypeScript/issues/37326
    const lang = activity.locale?.split('-')[0]
    const proactiveMessages = this.config.proactiveMessages || {}
    const message = lang && proactiveMessages[lang]

    if (message) {
      await this.adapter.continueConversation(convoRef, async (turnContext) => {
        await turnContext.sendActivity(message)
      })
    }
  }

  protected async context(base: ChannelContext<any>): Promise<TeamsContext> {
    return {
      ...base,
      client: this.adapter,
      messages: [],
      convoRef: await this.getConvoRef(base.thread!)
    }
  }

  private async getConvoRef(threadId: string): Promise<Partial<ConversationReference>> {
    let convoRef = this.convoRefs.get(threadId)
    if (convoRef) {
      return convoRef
    }

    convoRef = await this.app.kvs.get(threadId)
    this.convoRefs.set(threadId, convoRef!)
    return convoRef!
  }

  private async setConvoRef(threadId: string, convoRef: Partial<ConversationReference>): Promise<void> {
    if (this.convoRefs.get(threadId)) {
      return
    }

    this.convoRefs.set(threadId, convoRef)
    return this.app.kvs.set(threadId, convoRef)
  }
}
