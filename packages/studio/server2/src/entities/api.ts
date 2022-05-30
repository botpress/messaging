import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { EntityService } from './service'

export class EntityApi {
  constructor(private entities: EntityService) {}

  setup(router: PublicApiManager) {
    router.post('/nlu/entities', Schema.Api.Create, this.create.bind(this))
    router.post('/nlu/entities/:id', Schema.Api.Update, this.update.bind(this))
    router.post('/nlu/entities/:id/delete', Schema.Api.Delete, this.delete.bind(this))
    router.get('/nlu/entities', Schema.Api.List, this.list.bind(this))
  }

  async create(req: Request, res: Response) {
    await this.entities.create(req.body)
    res.sendStatus(201)
  }

  async update(req: Request, res: Response) {
    const id = req.params.id
    if (id !== req.body.id) {
      await this.entities.delete(id)
    }

    await this.entities.create(req.body)
    res.sendStatus(200)
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id
    await this.entities.delete(id)

    res.sendStatus(200)
  }

  async list(req: Request, res: Response) {
    res.send(await this.entities.list())
  }
}
