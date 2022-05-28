import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { NluService } from './service'

export class NluApi {
  constructor(private nlu: NluService) {}

  setup(router: PublicApiManager) {
    router.get('/nlu/info', Schema.Api.Info, this.get.bind(this))
  }

  async get(req: Request, res: Response) {
    res.send(await this.nlu.info())
  }
}
