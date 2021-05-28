import clc from 'cli-color'
import { Router } from 'express'
import { App } from '../../app'
import { uuid } from '../../base/types'
import { Logger } from '../../logger/types'
import { Conduit } from './conduit'

export abstract class Channel<TConduit extends Conduit<any, any>> {
  abstract get id(): uuid
  abstract get name(): string

  protected app!: App
  protected logger!: Logger
  protected router!: Router

  async setup(app: App, root: Router): Promise<void> {
    this.app = app
    this.logger = this.app.logger.root.sub(this.name)
    this.router = Router()

    root.use(
      this.getRoute(),
      async (req, res, next) => {
        const { provider } = req.params
        res.locals.conduit = await this.app.conduits.getInstanceByProviderName(provider, this.id)
        next()
      },
      this.router
    )

    await this.setupRoutes()
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

  abstract createConduit(): TConduit
  protected abstract setupRoutes(): Promise<void>
}
