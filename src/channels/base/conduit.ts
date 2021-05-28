import _ from 'lodash'
import { App } from '../../app'
import { uuid } from '../../base/types'
import { Logger } from '../../logger/types'
import { Endpoint } from '../../mapping/types'
import { Channel } from './channel'
import { ChannelConfig } from './config'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class Conduit<TConfig extends ChannelConfig, TContext extends ChannelContext<any>> {
  protected app!: App
  public config!: TConfig
  protected channel!: Channel<any>
  protected providerName!: string
  protected clientId!: uuid

  protected renderers!: ChannelRenderer<TContext>[]
  protected senders!: ChannelSender<TContext>[]
  protected logger!: Logger
  protected loggerIn!: Logger
  protected loggerOut!: Logger

  async setup(app: App, config: TConfig, channel: Channel<any>, providerName: string, clientId: string): Promise<void> {
    this.app = app
    this.config = config
    this.channel = channel
    this.providerName = providerName
    this.clientId = clientId

    this.logger = this.app.logger.root.sub(this.channel.name)
    this.loggerIn = this.logger.sub('incoming')
    this.loggerOut = this.logger.sub('outgoing')

    await this.setupConnection()
    this.renderers = this.setupRenderers().sort((a, b) => a.priority - b.priority)
    this.senders = this.setupSenders().sort((a, b) => a.priority - b.priority)
  }

  async receive(payload: any) {
    const endpoint = await this.map(payload)
    let mapping = await this.app.mapping.getByEndpoint(this.clientId!, this.channel.id, endpoint)

    if (!mapping) {
      const conversation = await this.app.conversations.forClient(this.clientId!).create(endpoint.foreignUserId!)
      mapping = await this.app.mapping.create(this.clientId!, this.channel.id, conversation.id, endpoint)
    }

    const message = await this.app.messages
      .forClient(this.clientId!)
      .create(mapping.conversationId, endpoint.content, endpoint.foreignUserId)

    this.loggerIn.debug('Received message', { providerName: this.providerName, clientId: this.clientId, message })
  }

  async send(conversationId: string, payload: any): Promise<void> {
    const mapping = await this.app.mapping.getByConversationId(this.clientId!, this.channel.id, conversationId)

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

    const message = await this.app.messages
      .forClient(this.clientId!)
      .create(conversationId, payload, mapping.foreignUserId)
    this.loggerOut.debug('Sending message', { providerName: this.providerName, clientId: this.clientId, message })
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
