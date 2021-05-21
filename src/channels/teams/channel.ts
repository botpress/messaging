import { Activity, BotFrameworkAdapter, ConversationReference, TurnContext } from 'botbuilder'
import _ from 'lodash'
import { Conversation } from '../../conversations/types'
import { Channel } from '../base/channel'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TeamsConfig } from './config'
import { TeamsContext } from './context'
import { TeamsRenderers } from './renderers'
import { TeamsSenders } from './senders'

export class TeamsChannel extends Channel<TeamsConfig, TeamsContext> {
  get id(): string {
    return 'teams'
  }

  private inMemoryConversationRefs: _.Dictionary<Partial<ConversationReference>> = {}
  private adapter!: BotFrameworkAdapter

  protected async setupConnection() {
    this.adapter = new BotFrameworkAdapter({
      appId: this.config.appId,
      appPassword: this.config.appPassword,
      channelAuthTenant: this.config.tenantId
    })

    this.router.post('/', async (req, res) => {
      await this.adapter.processActivity(req, <any>res, async (turnContext) => {
        const { activity } = turnContext

        const conversationReference = TurnContext.getConversationReference(activity)
        const threadId = conversationReference!.conversation!.id

        if (activity.value?.text) {
          activity.text = activity.value.text
        }

        // TODO: read proactive message
        /*
        if (this._botAddedToConversation(activity)) {
          // Locale format: {lang}-{subtag1}-{subtag2}-... https://en.wikipedia.org/wiki/IETF_language_tag
          // TODO: Use Intl.Locale().language once its types are part of TS. See: https://github.com/microsoft/TypeScript/issues/37326
          const lang = activity.locale?.split('-')[0]
          await this._sendProactiveMessage(activity, conversationReference, lang)
        }
        */

        if (activity.text) {
          await this.receive({ activity, threadId })
        }

        await this._setConversationRef(threadId, conversationReference)
      })
    })

    console.log(`Teams webhook listening at ${this.config.externalUrl + this.route()}`)
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TeamsRenderers]
  }

  protected setupSenders() {
    return TeamsSenders
  }

  protected map(payload: { activity: Activity; threadId: string }) {
    return {
      content: { type: 'text', text: payload.activity.text },
      userId: payload.threadId
    }
  }

  protected async context(conversation: Conversation) {
    const convoRef = await this._getConversationRef(conversation!.userId)

    return {
      client: this.adapter,
      messages: [],
      convoRef
    }
  }

  private async _getConversationRef(threadId: string): Promise<Partial<ConversationReference>> {
    let convRef = this.inMemoryConversationRefs[threadId]
    if (convRef) {
      return convRef
    }

    // cache miss
    // TODO: scope kvs
    convRef = await this.kvs.get(threadId)
    this.inMemoryConversationRefs[threadId] = convRef
    return convRef
  }

  private async _setConversationRef(threadId: string, convRef: Partial<ConversationReference>): Promise<void> {
    if (this.inMemoryConversationRefs[threadId]) {
      return
    }

    this.inMemoryConversationRefs[threadId] = convRef
    // TODO: scope kvs
    return this.kvs.set(threadId, convRef)
  }
}
