import { Request, Router, Response, RequestHandler, NextFunction } from 'express'
import { Logger } from './logger'
import { ChannelService } from './service'

export class ChannelApi<TService extends ChannelService<any, any>> {
  protected urlCallback?: (scope: string) => Promise<string>

  constructor(protected readonly service: TService) {}

  async setup(router: ChannelApiManager) {}

  makeUrl(callback: (scope: string) => Promise<string>) {
    this.urlCallback = callback
  }
}

export type Middleware<T> = (req: T, res: Response, next: NextFunction) => Promise<any>

export class ChannelApiManager {
  constructor(private service: ChannelService<any, any>, private router: Router, private logger?: Logger) {}

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
      this.asyncMiddleware(async (req, res, next) => {
        const nreq = req as ChannelApiRequest
        nreq.scope = req.params.scope

        try {
          await this.service.require(nreq.scope)
        } catch {
          return res.sendStatus(404)
        }

        await fn(nreq, res, next)
      })
    )
  }

  protected asyncMiddleware(fn: Middleware<Request>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch((e) => {
        this.logger?.error(e, `Error occurred calling route ${req.originalUrl}`)

        if (!res.headersSent) {
          return res.sendStatus(500)
        }
      })
    }
  }
}

export interface ChannelApiRequest extends Request {
  scope: string
}
