import clc from 'cli-color'
import { Router } from 'express'
import LRU from 'lru-cache'
import { uuid } from '../../base/types'
import { ConfigService } from '../../config/service'
import { ConversationService } from '../../conversations/service'
import { KvsService } from '../../kvs/service'
import { Logger, LoggerService } from '../../logger/service'
import { MappingService } from '../../mapping/service'
import { MessageService } from '../../messages/service'
import { ProviderService } from '../../providers/service'
import { Instance } from './instance'

export abstract class Channel<TInstance extends Instance<any, any>> {
  abstract get id(): uuid
  abstract get name(): string

  private cache!: LRU<string, TInstance>
  protected logger!: Logger

  constructor(
    protected configs: ConfigService,
    protected providers: ProviderService,
    protected kvs: KvsService,
    protected conversations: ConversationService,
    protected messages: MessageService,
    protected mapping: MappingService,
    protected router: Router,
    protected loggers: LoggerService
  ) {}

  async setup(): Promise<void> {
    // TODO clear cache progressively
    this.cache = new LRU()
    this.logger = this.loggers.root.sub(this.name)

    const oldRouter = this.router
    this.router = Router()
    oldRouter.use(
      this.getRoute(),
      async (req, res, next) => {
        const { provider } = req.params
        res.locals.instance = await this.getInstance(provider)
        next()
      },
      this.router
    )

    await this.setupRoutes()
  }

  async getInstance(providerName: string) {
    let instance = this.cache.get(providerName)
    if (instance) {
      return instance
    }

    const provider = (await this.providers.getByName(providerName))!
    const clientId = await this.providers.getClientId(provider.id)

    instance = this.createInstance(providerName, clientId!)

    await instance.setup({
      ...provider.config[this.name],
      externalUrl: this.configs.current.externalUrl
    })

    this.cache.set(providerName, instance)

    return instance
  }

  getRoute(path?: string) {
    return `/webhooks/:provider/${this.name}${path ? `/${path}` : ''}`
  }

  protected printWebhook(route?: string) {
    this.logger.info(
      `${clc.bold(this.name.charAt(0).toUpperCase() + this.name.slice(1))}` +
        `${route ? ' ' + route : ''}` +
        ` webhook ${clc.blackBright(this.getRoute(route))}`
    )
  }

  protected abstract createInstance(providerName: string, clientId: string): TInstance
  protected abstract setupRoutes(): Promise<void>
}
