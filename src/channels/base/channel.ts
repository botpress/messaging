import clc from 'cli-color'
import { NextFunction, Request, Response, Router } from 'express'
import { App } from '../../app'
import { uuid } from '../../base/types'
import { Logger } from '../../logger/types'
import { ConduitInstance } from './conduit'

export abstract class Channel<TConduit extends ConduitInstance<any, any>> {
  abstract get id(): uuid
  abstract get name(): string

  get initiable() {
    return false
  }

  get lazy() {
    return true
  }

  protected app!: App
  protected logger!: Logger
  protected router!: Router

  async setup(app: App, root: Router): Promise<void> {
    this.app = app
    this.logger = this.app.logger.root.sub(this.name)
    this.router = Router()

    root.use(
      this.getRoute(),
      this.asyncMiddleware(async (req, res, next) => {
        const { provider } = req.params
        const providerId = (await this.app.providers.getByName(provider))!.id
        const conduit = (await this.app.conduits.getByProviderAndChannel(providerId, this.id))!
        res.locals.conduit = await this.app.instances.get(conduit.id)
        next()
      }),
      this.router
    )

    await this.setupRoutes()
  }

  getRoute(path?: string) {
    return `/webhooks/:provider/${this.name}${path ? `/${path}` : ''}`
  }

  protected asyncMiddleware(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch((e) => {
        this.logger.error(`Error occurred calling route ${req.originalUrl}:`, e)
        return res.sendStatus(500)
      })
    }
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
