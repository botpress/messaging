import { Logger } from '@botpress/messaging-engine'
import { Request, Response } from 'express'

export type Middleware<T> = (req: T, res: Response) => Promise<any>

export abstract class AuthHandler {
  private logger = new Logger('API')

  protected asyncMiddleware(fn: Middleware<Request>) {
    return (req: Request, res: Response) => {
      fn(req, res).catch((e) => {
        this.logger.error(e, `Error occurred calling route ${req.originalUrl}`)

        if (!res.headersSent) {
          return res.sendStatus(500)
        }
      })
    }
  }
}
