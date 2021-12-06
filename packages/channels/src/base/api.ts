import { Request, Router, Response, RequestHandler } from 'express'
import { ChannelService } from './service'

export class ChannelApi<TService extends ChannelService<any, any>> {
  protected urlCallback?: (scope: string) => Promise<string>

  constructor(protected readonly service: TService) {}

  async setup(router: ChannelApiManager) {}

  makeUrl(callback: (scope: string) => Promise<string>) {
    this.urlCallback = callback
  }
}

export type Middleware<T> = (req: T, res: Response) => Promise<any>

export class ChannelApiManager {
  constructor(private service: ChannelService<any, any>, private router: Router) {}

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

  postRaw(path: string, fn: RequestHandler) {
    this.router.post(`/:scope${path}`, fn)
  }

  protected wrap(type: 'post' | 'get' | 'delete' | 'use', path: string, fn: Middleware<ChannelApiRequest>) {
    this.router[type](
      `/:scope${path}`,
      this.asyncMiddleware(async (req, res) => {
        const nreq = req as ChannelApiRequest
        nreq.scope = req.params.scope
        await this.service.require(nreq.scope)
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
