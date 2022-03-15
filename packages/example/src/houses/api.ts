import { ApiManager, ClientApiRequest } from '@botpress/framework'
import { uuid } from '@botpress/messaging-base'
import { Response } from 'express'
import { Schema } from './schema'
import { HouseService } from './service'

export class HouseApi {
  constructor(private houses: HouseService) {}

  setup(router: ApiManager) {
    router.post('/houses', Schema.Api.Create, this.create.bind(this))
    router.get('/houses/:id', Schema.Api.Get, this.get.bind(this))
  }

  async create(req: ClientApiRequest, res: Response) {
    const address = req.body.address as string

    const user = await this.houses.create(req.clientId, address)
    res.status(201).send(user)
  }

  async get(req: ClientApiRequest, res: Response) {
    const id = req.params.id as uuid

    const user = await this.houses.fetch(id)
    if (!user || user.clientId !== req.clientId) {
      return res.sendStatus(404)
    }

    res.send(user)
  }
}
