import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { EntityService } from './service'

export class EntityApi {
  constructor(private entities: EntityService) {}

  setup(router: PublicApiManager) {
    router.get('/nlu/entities', Schema.Api.List, this.list.bind(this))
  }

  async list(req: Request, res: Response) {
    res.send(await this.entities.list())
  }
}
