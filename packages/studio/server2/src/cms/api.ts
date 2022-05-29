import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { CmsService } from './service'

export class CmsApi {
  constructor(private cms: CmsService) {}

  setup(router: PublicApiManager) {
    router.get('/cms/types', Schema.Api.ListTypes, this.listTypes.bind(this))
    // TODO: why is this POST??
    router.post('/cms/elements', Schema.Api.ListElements, this.listElements.bind(this))
  }

  async listTypes(req: Request, res: Response) {
    res.send({ registered: await this.cms.listTypes(), unregistered: [] })
  }

  async listElements(req: Request, res: Response) {
    res.send(await this.cms.listElements())
  }
}
