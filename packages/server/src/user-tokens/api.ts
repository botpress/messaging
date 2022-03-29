import { uuid } from '@botpress/messaging-base'
import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { UserService } from '../users/service'
import { Schema } from './schema'
import { UserTokenService } from './service'

export class UserTokenApi {
  constructor(private users: UserService, private userTokens: UserTokenService) {}

  setup(router: ApiManager) {
    router.post('/users/tokens', Schema.Api.Create, this.create.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
    const userId = req.body.userId as uuid

    const user = await this.users.fetch(userId)
    if (!user || user.clientId !== req.clientId) {
      return res.sendStatus(404)
    }

    const tokenRaw = await this.userTokens.generateToken()
    const userToken = await this.userTokens.create(user.id, tokenRaw, undefined)

    res.status(201).send({ id: userToken.id, token: `${userToken.id}.${tokenRaw}` })
  }
}
