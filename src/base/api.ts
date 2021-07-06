import { Request, Response, NextFunction, Router } from 'express'
import { validate as validateUuid } from 'uuid'
import { ClientService } from '../clients/service'
import { Client } from '../clients/types'
import { Logger } from '../logger/types'

export abstract class BaseApi {
  private logger = new Logger('API')

  constructor(protected router: Router) {}

  abstract setup(): Promise<void>

  protected asyncMiddleware(fn: (req: ApiRequest, res: Response, next: NextFunction) => Promise<any>) {
    return (req: ApiRequest, res: Response, next: NextFunction) => {
      fn(req, res, next).catch((e) => {
        this.logger.error(`Error occured calling route ${req.originalUrl}:`, e)
        return res.sendStatus(500)
      })
    }
  }
}

export abstract class ClientScopedApi extends BaseApi {
  constructor(router: Router, private clients: ClientService) {
    super(router)
  }

  async extractClient(req: ApiRequest, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers.authorization
      const [_, auth] = authorization!.split(' ')
      const [clientId, clientToken] = Buffer.from(auth, 'base64').toString('utf-8').split(':')

      if (!validateUuid(clientId)) {
        return res.sendStatus(403)
      }

      const client = await this.clients.getByIdAndToken(clientId, clientToken)

      if (!client) {
        return res.sendStatus(403)
      } else {
        req.client = client
        next()
      }
    } catch {
      return res.sendStatus(403)
    }
  }
}

export type ApiRequest = Request & {
  client?: Client
}
