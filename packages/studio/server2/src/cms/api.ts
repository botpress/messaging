import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { CmsService } from './service'

export class CmsApi {
  constructor(private cms: CmsService) {}

  setup(router: PublicApiManager) {
    router.get('/cms/types', Schema.Api.ListTypes, this.listTypes.bind(this))
    router.post('/cms/:contentType?/elements', Schema.Api.ListElements, this.listElements.bind(this))
  }

  async listTypes(req: Request, res: Response) {
    res.send({ registered: await this.cms.listTypes(), unregistered: [] })
  }

  async listElements(req: Request, res: Response) {
    const { contentType } = req.params
    const { searchTerm, from, count, ids } = req.body

    let elements = await this.cms.listElements()

    if (contentType) {
      elements = elements.filter((x) => x.type === contentType)
    }

    if (searchTerm) {
      // TODO: does not scale very well
      elements = elements.filter((x) => x.id.includes(searchTerm) || JSON.stringify(x.formData).includes(searchTerm))
    }

    if (from) {
      elements = elements.slice(from)
    }

    elements = elements.slice(0, count || 50)

    if (ids) {
      elements = elements.filter((x) => ids.includes)
    }

    res.send(elements)
  }
}
