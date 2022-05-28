import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { FlowService } from './service'

export class FlowApi {
  constructor(private flows: FlowService) {}

  setup(router: PublicApiManager) {
    router.get('/flows', Schema.Api.List, this.list.bind(this))
  }

  async list(req: Request, res: Response) {
    res.send(await this.flows.list())
  }
}
