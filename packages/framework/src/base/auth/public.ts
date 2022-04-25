import { Request, Response } from 'express'
import { AuthHandler, Middleware } from './base'

export class PublicAuthHandler extends AuthHandler {
  public auth(fn: Middleware<Request>): (req: Request, res: Response) => void {
    return this.asyncMiddleware(fn)
  }
}
