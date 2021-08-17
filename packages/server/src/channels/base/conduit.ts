import { uuid } from '@botpress/messaging-base'
import clc from 'cli-color'
import _ from 'lodash'
import yn from 'yn'
import { App } from '../../app'
import { ServerCache } from '../../caching/cache'
import { Logger } from '../../logger/types'
import { Endpoint } from '../../mapping/types'
import { ChannelContext, IndexChoiceOption, IndexChoiceType } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class ConduitInstance<TConfig, TContext extends ChannelContext<any>> {
  protected app!: App
  public conduitId!: uuid
  public config!: TConfig

  protected renderers!: ChannelRenderer<TContext>[]
  protected senders!: ChannelSender<TContext>[]
  public logger!: Logger
  public loggerIn!: Logger
  public loggerOut!: Logger

  protected cacheIndexResponses!: ServerCache<string, IndexChoiceOption[]>

  async setup(conduitId: uuid, config: TConfig, app: App): Promise<void> {
    this.app = app
    this.config = config
    this.conduitId = conduitId

    const conduit = await this.app.conduits.get(conduitId)
    const channel = this.app.channels.getById(conduit!.channelId)

    this.logger = this.app.logger.root.sub(channel.name)
    this.loggerIn = this.logger.sub('incoming')
    this.loggerOut = this.logger.sub('outgoing')

    await this.setupConnection()
    this.renderers = this.setupRenderers().sort((a, b) => a.priority - b.priority)
    this.senders = this.setupSenders().sort((a, b) => a.priority - b.priority)

    const cacheName = 'cache_index_responses'
    this.cacheIndexResponses =
      this.app.caching.getCache(cacheName) || (await this.app.caching.newServerCache(cacheName))
  }

  async sendToEndpoint(endpoint: Endpoint, payload: any, clientId?: uuid) {
    const context = await this.getContext(
      {
        client: undefined,
        handlers: 0,
        payload: _.cloneDeep(payload),
        logger: this.logger,
        ...endpoint
      },
      clientId
    )

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        try {
          renderer.render(context)
        } catch (e) {
          this.logger.error(e, 'Error occurred when rendering a message')
        } finally {
          context.handlers++
        }
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        try {
          await sender.send(context)
        } catch (e) {
          this.logger.error(e, 'Error occurred when sending a message')
        }
      }
    }
  }

  async receive(payload: any) {
    const conduit = (await this.app.conduits.get(this.conduitId))!
    const provider = (await this.app.providers.getById(conduit.providerId))!
    const endpoint = await this.extractEndpoint(payload)

    if (!endpoint.content.type) {
      return
    }

    const clientId = provider.sandbox
      ? await this.app.instances.sandbox.getClientId(this.conduitId, endpoint)
      : (await this.app.clients.getByProviderId(provider.id))!.id

    if (!clientId) {
      return
    }

    const { userId, conversationId } = await this.app.mapping.getMapping(clientId, conduit.channelId, endpoint)
    return this.app.chat.send(conversationId, userId, endpoint.content, { endpoint: _.omit(endpoint, 'content') })
  }

  async initialize() {}

  async destroy() {}

  public abstract extractEndpoint(payload: any): Promise<EndpointContent>

  protected getIndexCacheKey(identity: string, sender: string) {
    return `${this.conduitId}_${identity}_${sender}`
  }

  protected prepareIndexResponse(identity: string, sender: string, options: IndexChoiceOption[]) {
    this.cacheIndexResponses.set(this.getIndexCacheKey(identity, sender), options)
  }

  protected handleIndexResponse(index: number, identity: string, sender: string): any | undefined {
    if (index) {
      const key = this.getIndexCacheKey(identity, sender)
      const options = this.cacheIndexResponses.get(key)

      this.cacheIndexResponses.del(key)

      const option = options?.[index - 1]

      if (option) {
        if (option.type === IndexChoiceType.PostBack) {
          return { type: option.type, payload: option.value }
        } else if (option.type === IndexChoiceType.SaySomething) {
          return { type: option.type, text: option.value }
        } else if (option.type === IndexChoiceType.QuickReply) {
          return { type: option.type, text: option.title, payload: option.value }
        } else if (option.type === IndexChoiceType.OpenUrl) {
          return {}
        }
      }

      return undefined
    }
  }

  protected async getRoute(path?: string) {
    const conduit = await this.app.conduits.get(this.conduitId)
    const provider = await this.app.providers.getById(conduit!.providerId)
    const channel = this.app.channels.getById(conduit!.channelId)
    const externalUrl = process.env.EXTERNAL_URL || this.app.config.current.server?.externalUrl

    return externalUrl + channel.getRoute(path).replace(':provider', provider!.name)
  }

  protected async printWebhook(path?: string) {
    if (yn(process.env.SPINNED)) {
      const externalUrl = process.env.EXTERNAL_URL || this.app.config.current.server?.externalUrl
      const conduit = await this.app.conduits.get(this.conduitId)
      const channel = this.app.channels.getById(conduit!.channelId)
      const provider = await this.app.providers.getById(conduit!.providerId)

      this.logger.info(
        `[${provider!.name}] ${clc.bold(channel.name.charAt(0).toUpperCase() + channel.name.slice(1))}${
          path ? ' ' + path : ''
        } webhook ${clc.blackBright(
          `${externalUrl}/webhooks/${provider!.name}/${channel.name}${path ? `/${path}` : ''}`
        )}`
      )
    }
  }

  protected abstract setupConnection(): Promise<void>
  protected abstract setupRenderers(): ChannelRenderer<TContext>[]
  protected abstract setupSenders(): ChannelSender<TContext>[]
  protected abstract getContext(base: ChannelContext<any>, clientId?: uuid): Promise<TContext>
}

export type EndpointContent = {
  content: any
} & Endpoint
