import { Request, Router, Response, RequestHandler } from 'express'

export type Middleware<T> = (req: T, res: Response) => Promise<any>

export class ChannelApiManager {
  constructor(public router: Router) {}

  post(path: string, fn: Middleware<ChannelApiRequest>) {
    this.wrap('post', path, fn)
  }

  get(path: string, fn: Middleware<ChannelApiRequest>) {
    this.wrap('get', path, fn)
  }

  delete(path: string, fn: Middleware<ChannelApiRequest>) {
    this.wrap('delete', path, fn)
  }

  use(path: string, fn: RequestHandler) {
    this.router.use(`/:scope${path}`, fn)
  }

  protected wrap(type: 'post' | 'get' | 'delete' | 'use', path: string, fn: Middleware<ChannelApiRequest>) {
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
