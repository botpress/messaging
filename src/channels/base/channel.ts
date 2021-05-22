import express, { Router } from 'express'
import _ from 'lodash'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { Logger, LoggerService } from '../../logger/service'
import { Endpoint, MappingService } from '../../mapping/service'
import { MessageService } from '../../messages/service'
import { ChannelConfig } from './config'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class Channel<TConfig extends ChannelConfig, TContext extends ChannelContext<any>> {
  abstract get id(): string

  get enableParsers(): boolean {
    return false
  }

  public config!: TConfig
  // TODO: change this
  protected botId = 'default'
  protected renderers!: ChannelRenderer<TContext>[]
  protected senders!: ChannelSender<TContext>[]
  protected logger!: Logger
  protected loggerIn!: Logger
  protected loggerOut!: Logger

  constructor(
    protected kvs: KvsService,
    protected conversations: ConversationService,
    protected messages: MessageService,
    protected mapping: MappingService,
    protected loggers: LoggerService,
    protected router: Router
  ) {}

  async setup(): Promise<void> {
    this.logger = this.loggers.root.sub(this.id)
    this.loggerIn = this.logger.sub('incoming')
    this.loggerOut = this.logger.sub('outgoing')

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
    const endpoint = await this.map(payload)
    let mapping = await this.mapping.conversation(this.id, endpoint)

    if (!mapping) {
      const conversation = await this.conversations.forBot(this.botId).create(endpoint.foreignConversationId!)
      mapping = await this.mapping.create(this.id, conversation.id, endpoint)
    }

    const message = await this.messages
      .forBot(this.botId)
      .create(mapping.conversationId, endpoint.content, endpoint.foreignUserId)

    this.loggerIn.debug('Received message', message)
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const mapping = await this.mapping.endpoint(this.id, conversationId)

    const context = await this.context({
      client: undefined,
      handlers: 0,
      payload: _.cloneDeep(payload),
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/',
      ...mapping
    })

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        renderer.render(context)
        context.handlers++
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        await sender.send(context)
      }
    }

    const message = await this.messages.forBot(this.botId).create(conversationId, payload, mapping.foreignUserId)
    this.loggerOut.debug('Sending message', message)
  }

  protected route(path?: string) {
    return `/webhooks/${this.id}${path ? `/${path}` : ''}`
  }

  protected abstract setupConnection(): Promise<void>
  protected abstract setupRenderers(): ChannelRenderer<TContext>[]
  protected abstract setupSenders(): ChannelSender<TContext>[]
  protected abstract map(payload: any): Promise<EndpointContent>
  protected abstract context(base: ChannelContext<any>): Promise<TContext>
}

export type EndpointContent = {
  content: any
} & Endpoint
