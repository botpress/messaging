import { Request, Response } from 'express'
import { AuthHandler, Middleware } from './base'

export class AdminAuthHandler extends AuthHandler {
  public auth(fn: Middleware<Request>) {
    return this.asyncMiddleware(async (req: Request, res: Response) => {
      const key = req.headers['x-bp-messaging-admin-key'] as string

      if (process.env.ADMIN_KEY?.length && key !== process.env.ADMIN_KEY) {
        return res.sendStatus(401)
      }

      return fn(req, res)
    })
  }
}
