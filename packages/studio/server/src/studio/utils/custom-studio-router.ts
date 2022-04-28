import { asyncMiddleware, AsyncMiddleware } from '@botpress/common'
import { Logger } from '@botpress/sdk'
import { RequestHandler, Router } from 'express'
import { NLUService } from '../nlu'

// TODO: delete this ..
export abstract class CustomStudioRouter {
  protected logger: Logger
  protected nluService: NLUService

  protected readonly needPermissions: (operation: string, resource: string) => RequestHandler
  protected readonly asyncMiddleware: AsyncMiddleware
  protected readonly checkTokenHeader: RequestHandler

  public readonly router: Router

  constructor(name: string, logger: Logger, nlu: NLUService) {
    this.asyncMiddleware = asyncMiddleware(logger, name)
    this.needPermissions = (resource: string, operation: string) => (req, res, next) => next() // TODO: remove them all
    this.checkTokenHeader = (req, res, next) => next()
    this.router = Router({ mergeParams: true })
    this.logger = logger
    this.nluService = nlu
  }
}
