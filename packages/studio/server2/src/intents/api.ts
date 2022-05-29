import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { IntentService } from './service'

export class IntentApi {
  constructor(private intents: IntentService) {}

  setup(router: PublicApiManager) {
    router.get('/nlu/intents/:name', Schema.Api.Get, this.get.bind(this))
    router.get('/nlu/intents', Schema.Api.List, this.list.bind(this))
    router.get('/nlu/contexts', Schema.Api.ListContexts, this.listContexts.bind(this))
  }

  async get(req: Request, res: Response) {
    const name = req.params.name
    res.send(await this.intents.get(name))
  }

  async list(req: Request, res: Response) {
    res.send(await this.intents.list())
  }

  async listContexts(req: Request, res: Response) {
    res.send(await this.intents.listContexts())
  }
}
