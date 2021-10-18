import { Request, Response, NextFunction } from 'express'
import { Logger } from '../../logger/types'

export type Middleware<T> = (req: T, res: Response, next: NextFunction) => Promise<any>

export abstract class AuthHandler {
  private logger = new Logger('API')

  protected asyncMiddleware(fn: Middleware<Request>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch((e) => {
        this.logger.error(e, `Error occurred calling route ${req.originalUrl}`)
        return res.sendStatus(500)
      })
    }
  }
}
