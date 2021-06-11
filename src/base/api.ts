import { Request, Response, NextFunction, Router } from 'express'
import { ClientService } from '../clients/service'
import { Client } from '../clients/types'

export abstract class BaseApi {
  constructor(protected router: Router) {}

  abstract setup(): Promise<void>
}

export abstract class ClientApi extends BaseApi {
  constructor(router: Router, private clients: ClientService) {
    super(router)
  }

  async extractClient(req: ApiRequest, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization
    const [_, auth] = authorization!.split(' ')
    const [clientId, clientToken] = Buffer.from(auth, 'base64').toString('utf-8').split(':')

    const client = await this.clients.getByIdAndToken(clientId, clientToken)

    if (!client) {
      return res.sendStatus(403)
    } else {
      req.client = client
      next()
    }
  }
}

export type ApiRequest = Request & {
  client?: Client
}
