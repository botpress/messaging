import { uuid } from '@botpress/messaging-base'
import { Request, Response } from 'express'
import { ClientTokenService } from '../../client-tokens/service'
import { AuthHandler, Middleware } from './base'

export class ClientAuthHandler extends AuthHandler {
  constructor(private clientTokens: ClientTokenService) {
    super()
  }

  public auth(fn: Middleware<ClientApiRequest>) {
    return this.asyncMiddleware(async (req: Request, res: Response) => {
      const clientId = req.headers['x-bp-messaging-client-id'] as string
      const clientToken = req.headers['x-bp-messaging-client-token'] as string

      const client = await this.clientTokens.verifyToken(clientId, clientToken)
      if (!client) {
        return res.sendStatus(401)
      }

      const clientApiReq = req as ClientApiRequest
      clientApiReq.clientId = clientId
      return fn(clientApiReq, res)
    })
  }
}

export type ClientApiRequest = Request & {
  clientId: uuid
}
