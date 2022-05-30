import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { ActionService } from './service'

export class ActionApi {
  constructor(private actions: ActionService) {}

  setup(router: PublicApiManager) {
    router.get('/actions', Schema.Api.List, this.list.bind(this))
  }

  async list(req: Request, res: Response) {
    res.send(await this.actions.list())
  }
}
