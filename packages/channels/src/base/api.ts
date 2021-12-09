import clc from 'cli-color'
import { Request, Router, Response, RequestHandler, NextFunction } from 'express'
import yn from 'yn'
import { Logger } from './logger'
import { ChannelService } from './service'

export class ChannelApi<TService extends ChannelService<any, any>> {
  protected urlCallback?: (scope: string) => Promise<string>

  constructor(protected readonly service: TService) {}

  async setup(router: ChannelApiManager) {}

  makeUrl(callback: (scope: string) => Promise<string>) {
    this.urlCallback = callback
  }

  protected async printWebhook(scope: string, name: string, path?: string) {
    // TODO: remove this dependency on server env vars
    if (yn(process.env.SPINNED)) {
      const externalUrl = await this.urlCallback!(scope)

      this.service.logger?.info(
        `[${scope}] ${clc.bold(name.charAt(0).toUpperCase() + name.slice(1))}${
          path ? ' ' + path : ''
        } webhook ${clc.blackBright(`${externalUrl}/${name}${path ? `/${path}` : ''}`)}`
      )
    }
  }
}

export type Middleware<T> = (req: T, res: Response, next: NextFunction) => Promise<void>

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
        await this.service.require(nreq.scope)
        await fn(nreq, res, next)
      })
    )
  }

  protected asyncMiddleware(fn: Middleware<Request>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch((e) => {
        this.logger?.error(`Error occurred calling route ${req.originalUrl}`, e)
        return res.sendStatus(500)
      })
    }
  }
}

export interface ChannelApiRequest extends Request {
  scope: string
}
