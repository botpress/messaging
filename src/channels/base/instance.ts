import clc from 'cli-color'
import express, { Router } from 'express'
import _ from 'lodash'
import { uuid } from '../../base/types'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { Logger, LoggerService } from '../../logger/service'
import { Endpoint, MappingService } from '../../mapping/service'
import { MessageService } from '../../messages/service'
import { ChannelConfig } from './config'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class Instance<TConfig extends ChannelConfig, TContext extends ChannelContext<any>> {
  abstract get id(): string

  get enableParsers(): boolean {
    return false
  }

  protected config!: TConfig
  protected renderers!: ChannelRenderer<TContext>[]
  protected senders!: ChannelSender<TContext>[]
  protected logger!: Logger
  protected loggerIn!: Logger
  protected loggerOut!: Logger

  constructor(
    protected providerId: string,
    protected clientId: uuid | undefined,
    protected kvs: KvsService,
    protected conversations: ConversationService,
    protected messages: MessageService,
    protected mapping: MappingService,
    protected loggers: LoggerService,
    protected router: Router
  ) {}

  async setup(config: TConfig): Promise<void> {
    this.config = config

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
    let mapping = await this.mapping.conversation(this.clientId!, this.id, endpoint)

    if (!mapping) {
      const conversation = await this.conversations.forClient(this.clientId!).create(endpoint.foreignUserId!)
      mapping = await this.mapping.create(this.clientId!, this.id, conversation.id, endpoint)
    }

    const message = await this.messages
      .forClient(this.clientId!)
      .create(mapping.conversationId, endpoint.content, endpoint.foreignUserId)

    this.loggerIn.debug('Received message', { providerId: this.providerId, clientId: this.clientId, message })
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const mapping = await this.mapping.endpoint(this.clientId!, this.id, conversationId)

    const context = await this.context({
      client: undefined,
      handlers: 0,
      payload: _.cloneDeep(payload),
      // TODO: bot url
      botUrl: 'https://duckduckgo.com/',
      logger: this.logger,
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

    const message = await this.messages.forClient(this.clientId!).create(conversationId, payload, mapping.foreignUserId)
    this.loggerOut.debug('Sending message', { providerId: this.providerId, clientId: this.clientId, message })
  }

  protected route(path?: string) {
    return `/webhooks/${this.providerId}/${this.id}${path ? `/${path}` : ''}`
  }

  protected abstract setupConnection(): Promise<void>
  protected abstract setupRenderers(): ChannelRenderer<TContext>[]
  protected abstract setupSenders(): ChannelSender<TContext>[]
  protected abstract map(payload: any): Promise<EndpointContent>
  protected abstract context(base: ChannelContext<any>): Promise<TContext>

  protected printWebhook(route?: string) {
    this.logger.info(
      `${clc.bold(this.id.charAt(0).toUpperCase() + this.id.slice(1))}` +
        `${route ? ' ' + route : ''}` +
        ` webhook ${clc.blackBright(this.route(route))}`
    )
  }
}

export type EndpointContent = {
  content: any
} & Endpoint
