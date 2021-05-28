import clc from 'cli-color'
import { Router } from 'express'
import LRU from 'lru-cache'
import { App } from '../../app'
import { uuid } from '../../base/types'
import { Logger } from '../../logger/types'
import { Conduit } from './conduit'

export abstract class Channel<TConduit extends Conduit<any, any>> {
  abstract get id(): uuid
  abstract get name(): string

  private app!: App
  protected router!: Router

  private cacheByName!: LRU<string, TConduit>
  private cacheById!: LRU<uuid, TConduit>
  protected logger!: Logger

  async setup(app: App, router: Router): Promise<void> {
    this.app = app
    this.router = router

    // TODO: remove unused conduits
    this.cacheByName = new LRU()
    this.cacheById = new LRU()
    this.logger = this.app.logger.root.sub(this.name)

    const oldRouter = this.router
    this.router = Router()
    oldRouter.use(
      this.getRoute(),
      async (req, res, next) => {
        const { provider } = req.params
        res.locals.conduit = await this.getConduitByProviderName(provider)
        next()
      },
      this.router
    )

    await this.setupRoutes()
  }

  async getConduitByProviderName(providerName: string): Promise<TConduit> {
    const cached = this.cacheByName.get(providerName)
    if (cached) {
      return cached
    }

    const provider = (await this.app.providers.getByName(providerName))!
    return this.getConduitByProviderId(provider.id)
  }

  async getConduitByProviderId(providerId: uuid): Promise<TConduit> {
    const cached = this.cacheById.get(providerId)
    if (cached) {
      return cached
    }

    const provider = (await this.app.providers.getById(providerId))!
    const clientId = (await this.app.providers.getClientId(providerId))!
    const conduit = this.createConduit()

    await conduit.setup(
      this.app,
      {
        ...provider.config[this.name],
        externalUrl: this.app.config.current.externalUrl
      },
      this,
      provider.name,
      clientId
    )

    this.cacheById.set(provider.id, conduit)
    this.cacheByName.set(provider.name, conduit)

    return conduit
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

  protected abstract createConduit(): TConduit
  protected abstract setupRoutes(): Promise<void>
}
