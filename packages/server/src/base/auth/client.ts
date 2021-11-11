import { Request, Response, NextFunction } from 'express'
import { validate as validateUuid } from 'uuid'
import { ClientService } from '../../clients/service'
import { Client } from '../../clients/types'
import { AuthHandler, Middleware } from './base'

export class ClientAuthHandler extends AuthHandler {
  constructor(private clients: ClientService) {
    super()
  }

  public auth(fn: Middleware<ClientApiRequest>) {
    return this.asyncMiddleware(async (req: Request, res: Response) => {
      const clientId = req.headers['x-bp-messaging-client-id'] as string
      const clientToken = req.headers['x-bp-messaging-client-token'] as string

      if (!validateUuid(clientId)) {
        return res.sendStatus(401)
      }

      const client = await this.clients.getByIdAndToken(clientId, clientToken)
      if (!client) {
        return res.sendStatus(401)
      }

      const clientApiReq = req as ClientApiRequest
      clientApiReq.client = client
      return fn(clientApiReq, res)
    })
  }
}

export type ClientApiRequest = Request & {
  client: Client
}
