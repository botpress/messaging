import clc from 'cli-color'
import { Router } from 'express'
import LRU from 'lru-cache'
import { App } from '../../app'
import { uuid } from '../../base/types'
import { Logger } from '../../logger/types'
import { Instance } from './instance'

export abstract class Channel<TInstance extends Instance<any, any>> {
  abstract get id(): uuid
  abstract get name(): string

  private app!: App
  protected router!: Router

  private cacheByName!: LRU<string, TInstance>
  private cacheById!: LRU<uuid, TInstance>
  protected logger!: Logger

  async setup(app: App, router: Router): Promise<void> {
    this.app = app
    this.router = router

    // TODO: remove unused instances
    this.cacheByName = new LRU()
    this.cacheById = new LRU()
    this.logger = this.app.logger.root.sub(this.name)

    const oldRouter = this.router
    this.router = Router()
    oldRouter.use(
      this.getRoute(),
      async (req, res, next) => {
        const { provider } = req.params
        res.locals.instance = await this.getInstanceByProviderName(provider)
        next()
      },
      this.router
    )

    await this.setupRoutes()
  }

  async getInstanceByProviderName(providerName: string): Promise<TInstance> {
    const cached = this.cacheByName.get(providerName)
    if (cached) {
      return cached
    }

    const provider = (await this.app.providers.getByName(providerName))!
    return this.getInstanceByProviderId(provider.id)
  }

  async getInstanceByProviderId(providerId: uuid): Promise<TInstance> {
    const cached = this.cacheById.get(providerId)
    if (cached) {
      return cached
    }

    const provider = (await this.app.providers.getById(providerId))!
    const clientId = (await this.app.providers.getClientId(providerId))!
    const instance = this.createInstance()

    await instance.setup(
      this.app,
      {
        ...provider.config[this.name],
        externalUrl: this.app.config.current.externalUrl
      },
      this,
      provider.name,
      clientId
    )

    this.cacheById.set(provider.id, instance)
    this.cacheByName.set(provider.name, instance)

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

  protected abstract createInstance(): TInstance
  protected abstract setupRoutes(): Promise<void>
}
