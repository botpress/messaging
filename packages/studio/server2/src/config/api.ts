import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { ConfigService } from './service'

export class ConfigApi {
  constructor(private config: ConfigService) {}

  setup(router: PublicApiManager) {
    router.get('/config', Schema.Api.Get, this.get.bind(this))
  }

  async get(req: Request, res: Response) {
    res.send(await this.config.get())
  }
}
