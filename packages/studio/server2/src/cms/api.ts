import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { CmsService } from './service'

export class CmsApi {
  constructor(private cms: CmsService) {}

  setup(router: PublicApiManager) {
    router.get('/cms/types', Schema.Api.ListTypes, this.listTypes.bind(this))
  }

  async listTypes(req: Request, res: Response) {
    res.send({ registered: await this.cms.listTypes(), unregistered: [] })
  }
}
