import { Logger } from 'botpress/sdk'
import { RequestHandler, Router } from 'express'
import { asyncMiddleware, AsyncMiddleware } from '../../common/http'

// TODO: delete this ..
export abstract class CustomStudioRouter {
  protected logger: Logger

  protected readonly needPermissions: (operation: string, resource: string) => RequestHandler
  protected readonly asyncMiddleware: AsyncMiddleware
  protected readonly checkTokenHeader: RequestHandler

  public readonly router: Router

  constructor(name: string, logger: Logger) {
    this.asyncMiddleware = asyncMiddleware(logger, name)
    this.needPermissions = (resource: string, operation: string) => (req, res, next) => next() // TODO: remove them all
    this.checkTokenHeader = (req, res, next) => next()
    this.router = Router({ mergeParams: true })
    this.logger = logger
  }
}
