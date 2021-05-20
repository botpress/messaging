import { Activity, BotFrameworkAdapter, ConversationReference, TurnContext } from 'botbuilder'
import _ from 'lodash'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Channel } from '../base/channel'
import { Routers } from '../types'
import { TeamsConfig } from './config'
import { TeamsContext } from './context'
import { TeamsCardRenderer } from './renderers/card'
import { TeamsCarouselRenderer } from './renderers/carousel'
import { TeamsChoicesRenderer } from './renderers/choices'
import { TeamsDropdownRenderer } from './renderers/dropdown'
import { TeamsImageRenderer } from './renderers/image'
import { TeamsTextRenderer } from './renderers/text'
import { TeamsCommonSender } from './senders/common'
import { TeamsTypingSender } from './senders/typing'

export class TeamsChannel extends Channel {
  private renderers = [
    new TeamsCardRenderer(),
    new TeamsTextRenderer(),
    new TeamsImageRenderer(),
    new TeamsCarouselRenderer(),
    new TeamsDropdownRenderer(),
    new TeamsChoicesRenderer()
  ]
  private senders = [new TeamsTypingSender(), new TeamsCommonSender()]

  private config!: TeamsConfig
  private kvs!: KvsService
  private conversations!: ConversationService
  private messages!: MessageService

  private inMemoryConversationRefs: _.Dictionary<Partial<ConversationReference>> = {}
  private adapter!: BotFrameworkAdapter

  get id(): string {
    return 'teams'
  }

  private botId: string = 'default'

  async setup(
    config: TeamsConfig,
    kvsService: KvsService,
    conversationService: ConversationService,
    messagesService: MessageService,
    routers: Routers
  ): Promise<void> {
    this.config = config
    this.kvs = kvsService
    this.conversations = conversationService
    this.messages = messagesService

    this.adapter = new BotFrameworkAdapter({
      appId: this.config.appId,
      appPassword: this.config.appPassword,
      channelAuthTenant: this.config.tenantId
    })

    const route = '/webhooks/teams'
    routers.full.post(route, async (req, res) => {
      await this.receive(<any>req, <any>res)
    })

    console.log(`Teams webhook listening at ${this.config.externalUrl + route}`)
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

  async _sendIncomingEvent(activity: Activity, threadId: string) {
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
}
