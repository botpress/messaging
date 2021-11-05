import { uuid } from '@botpress/messaging-base'
import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { Schema } from './schema'
import { UserService } from './service'

export class UserApi {
  constructor(private users: UserService) {}

  setup(router: ApiManager) {
    router.post('/users', Schema.Api.Create, this.create.bind(this))
    router.get('/users/:id', Schema.Api.Get, this.get.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
    const user = await this.users.create(req.client.id)
    res.status(201).send(user)
  }

  async get(req: ClientApiRequest, res: Response) {
    const id = req.params.id as uuid

    const user = await this.users.get(id)
    if (!user || user.clientId !== req.client.id) {
      return res.sendStatus(404)
    }

    res.send(user)
  }
}
