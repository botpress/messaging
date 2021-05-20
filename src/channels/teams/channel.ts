import { Activity, BotFrameworkAdapter, ConversationReference, TurnContext } from 'botbuilder'
import _ from 'lodash'
import { Channel } from '../base/channel'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TeamsConfig } from './config'
import { TeamsContext } from './context'
import { TeamsCarouselRenderer } from './renderers/carousel'
import { TeamsChoicesRenderer } from './renderers/choices'
import { TeamsDropdownRenderer } from './renderers/dropdown'
import { TeamsImageRenderer } from './renderers/image'
import { TeamsTextRenderer } from './renderers/text'
import { TeamsCommonSender } from './senders/common'
import { TeamsTypingSender } from './senders/typing'

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

    const route = '/webhooks/teams'
    this.routers.full.post(route, async (req, res) => {
      await this.receive(<any>req, <any>res)
    })

    console.log(`Teams webhook listening at ${this.config.externalUrl + route}`)
  }

  protected setupRenderers() {
    return [
      new CardToCarouselRenderer(),
      new TeamsTextRenderer(),
      new TeamsImageRenderer(),
      new TeamsCarouselRenderer(),
      new TeamsDropdownRenderer(),
      new TeamsChoicesRenderer()
    ]
  }

  protected setupSenders() {
    return [new TeamsTypingSender(), new TeamsCommonSender()]
  }

  async receive(req: Request, res: Response) {
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
        await this._sendIncomingEvent(activity, threadId)
      }

      await this._setConversationRef(threadId, conversationReference)
    })
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const conversation = await this.conversations.forBot(this.botId).get(conversationId)
    const convoRef = await this._getConversationRef(conversation!.userId)

    const context: TeamsContext = {
      client: this.adapter,
      handlers: [],
      payload: _.cloneDeep(payload),
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/',
      messages: [],
      convoRef
    }

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        renderer.render(context)

        // TODO: do we need ids?
        context.handlers.push('id')
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        await sender.send(context)
      }
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

  private async _sendIncomingEvent(activity: Activity, threadId: string) {
    const {
      text,
      from: { id: userId },
      type
    } = activity

    // TODO: mapping
    const conversation = await this.conversations.forBot(this.botId).recent(threadId)
    const message = await this.messages.forBot(this.botId).create(conversation.id, { type: 'text', text }, threadId)
    console.log('teams send webhook', message)
  }
}
