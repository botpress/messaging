import express, { Router } from 'express'
import _ from 'lodash'
import { ConversationService } from '../../conversations/service'
import { Conversation } from '../../conversations/types'
import { KvsService } from '../../kvs/service'
import { MessageService } from '../../messages/service'
import { Message } from '../../messages/types'
import { ChannelConfig } from './config'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class Channel<TConfig extends ChannelConfig, TContext extends ChannelContext<any>> {
  abstract get id(): string

  get enableParsers(): boolean {
    return false
  }

  // TODO: keep this public?
  public config!: TConfig
  protected renderers: ChannelRenderer<TContext>[] = []
  protected senders: ChannelSender<TContext>[] = []

  // TODO: change this
  protected botId = 'default'

  constructor(
    protected kvs: KvsService,
    protected conversations: ConversationService,
    protected messages: MessageService,
    protected router: Router
  ) {}

  async setup(): Promise<void> {
    const oldRouter = this.router
    this.router = Router()
    if (this.enableParsers) {
      this.router.use(express.json())
      this.router.use(express.urlencoded({ extended: true }))
    }
    oldRouter.use(this.route(), this.router)

    await this.setupConnection()
    this.renderers = this.setupRenderers().sort((a, b) => a.priority - b.priority)
    this.senders = this.setupSenders().sort((a, b) => a.priority - b.priority)
  }

  async receive(payload: any) {
    const map = this.map(payload)

    const conversation = await this.conversations.forBot(this.botId).recent(map.userId)
    const message = await this.messages.forBot(this.botId).create(conversation.id, map.content, map.userId)

    await this.afterReceive(payload, conversation, message)

    console.log(`${this.id} send webhook`, message)
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const conversation = (await this.conversations.forBot(this.botId).get(conversationId))!

    const context: TContext = {
      handlers: [],
      payload: _.cloneDeep(payload),
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/',
      ...(await this.context(conversation))
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

    const message = await this.messages.forBot(this.botId).create(conversation.id, payload, conversation.userId)
    console.log(`${this.id} message sent`, message)
  }

  protected route(path?: string) {
    return `/webhooks/${this.id}${path ? `/${path}` : ''}`
  }

  protected async afterReceive(payload: any, conversation: Conversation, message: Message) {}
  protected abstract setupConnection(): Promise<void>
  protected abstract setupRenderers(): ChannelRenderer<TContext>[]
  protected abstract setupSenders(): ChannelSender<TContext>[]
  protected abstract context(conversation: Conversation): Promise<any>
  protected abstract map(payload: any): { userId: string; content: any }
}
