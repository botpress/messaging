import { Request, Router, Response } from 'express'

export type Middleware<T> = (req: T, res: Response) => Promise<any>

export class ChannelApiManager {
  constructor(private router: Router) {}

  post(path: string, fn: Middleware<ChannelApiRequest>) {
    this.use('post', path, fn)
  }

  get(path: string, fn: Middleware<ChannelApiRequest>) {
    this.use('get', path, fn)
  }

  delete(path: string, fn: Middleware<ChannelApiRequest>) {
    this.use('delete', path, fn)
  }

  use(type: 'post' | 'get' | 'delete', path: string, fn: Middleware<ChannelApiRequest>) {
    this.router[type](
      `/:scope${path}`,
      this.asyncMiddleware(async (req, res) => {
        const nreq = req as ChannelApiRequest
        nreq.scope = req.params.scope
        await fn(nreq, res)
      })
    )
  }

  protected asyncMiddleware(fn: Middleware<Request>) {
    return (req: Request, res: Response) => {
      fn(req, res).catch((e) => {
        console.error(`Error occurred calling route ${req.originalUrl}`, e)
        return res.sendStatus(200)
      })
    }
  }
}

export interface ChannelApiRequest extends Request {
  scope: string
}
