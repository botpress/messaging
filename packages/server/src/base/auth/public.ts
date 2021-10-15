import { Request } from 'express'
import { AuthHandler, Middleware } from './base'

export class PublicAuthHandler extends AuthHandler {
  public auth(fn: Middleware<Request>) {
    return this.asyncMiddleware(fn)
  }
}
