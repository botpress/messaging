import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { HintService } from './service'

export class HintApi {
  constructor(private hints: HintService) {}

  setup(router: PublicApiManager) {
    router.get('/hints', Schema.Api.Get, this.get.bind(this))
  }

  async get(req: Request, res: Response) {
    res.send(await this.hints.get())
  }
}
