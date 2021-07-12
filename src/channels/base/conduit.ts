import _ from 'lodash'
import { App } from '../../app'
import { uuid } from '../../base/types'
import { ServerCache } from '../../caching/cache'
import { ChoiceOption } from '../../content/types'
import { Logger } from '../../logger/types'
import { Endpoint } from '../../mapping/types'
import { ChannelConfig } from './config'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'

export abstract class ConduitInstance<TConfig extends ChannelConfig, TContext extends ChannelContext<any>> {
  protected app!: App
  public conduitId!: uuid
  public config!: TConfig

  protected renderers!: ChannelRenderer<TContext>[]
  protected senders!: ChannelSender<TContext>[]
  public logger!: Logger
  public loggerIn!: Logger
  public loggerOut!: Logger

  protected cacheIndexResponses!: ServerCache<string, ChoiceOption[]>

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

    const cacheKey = `cache_index_responses_${conduitId}`

    this.cacheIndexResponses =
      this.app.caching.getCache<ServerCache<string, ChoiceOption[]>>(cacheKey) ||
      (await this.app.caching.newServerCache(cacheKey))
  }

  async sendToEndpoint(endpoint: Endpoint, payload: any, clientId?: uuid) {
    const context = await this.context(
      {
        client: undefined,
        handlers: 0,
        payload: _.cloneDeep(payload),
        // TODO: bot url
        botUrl: 'https://duckduckgo.com/',
        logger: this.logger,
        ...endpoint
      },
      clientId
    )

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
  }

  protected getKvsKey(identity: string, sender: string) {
    return `${this.conduitId}_${identity}_${sender}`
  }

  prepareIndexResponse(identity: string, sender: string, options: any) {
    this.cacheIndexResponses.set(this.getKvsKey(identity, sender), options)
  }

  handleIndexResponse(index: number, identity: string, sender: string): undefined | string {
    if (index) {
      const key = this.getKvsKey(identity, sender)
      const options = this.cacheIndexResponses.get(key)

      this.cacheIndexResponses.del(key)

      return options?.[index - 1]?.value
    }
  }

  async initialize() {}

  async destroy() {}

  public abstract extractEndpoint(payload: any): Promise<EndpointContent>

  protected abstract setupConnection(): Promise<void>
  protected abstract setupRenderers(): ChannelRenderer<TContext>[]
  protected abstract setupSenders(): ChannelSender<TContext>[]
  protected abstract context(base: ChannelContext<any>, clientId?: uuid): Promise<TContext>
}

export type EndpointContent = {
  content: any
} & Endpoint
