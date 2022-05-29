import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { IntentService } from './service'

export class IntentApi {
  constructor(private intents: IntentService) {}

  setup(router: PublicApiManager) {
    router.get('/nlu/intents', Schema.Api.List, this.list.bind(this))
  }

  async list(req: Request, res: Response) {
    res.send(await this.intents.list())
  }
}
