import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { FlowService } from './service'

export class FlowApi {
  constructor(private flows: FlowService) {}

  setup(router: PublicApiManager) {
    router.get('/flows', Schema.Api.List, this.list.bind(this))
    router.post('/flows', Schema.Api.Create, this.create.bind(this))
    router.post('/flows/:name', Schema.Api.Update, this.update.bind(this))
  }

  async list(req: Request, res: Response) {
    res.send(await this.flows.list())
  }

  async create(req: Request, res: Response) {
    const flow = req.body.flow

    await this.flows.update(flow)

    res.sendStatus(201)
  }

  async update(req: Request, res: Response) {
    // TODO: rename doesn't work

    const name = req.params.name
    const flow = req.body.flow

    await this.flows.update(flow)

    res.sendStatus(200)
  }
}
