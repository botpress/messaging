import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { Schema } from './schema'
import { CmsService } from './service'

export class CmsApi {
  constructor(private cms: CmsService) {}

  setup(router: PublicApiManager) {
    router.get('/cms/types', Schema.Api.ListTypes, this.listTypes.bind(this))
    router.post('/cms/:contentType?/elements', Schema.Api.ListElements, this.listElements.bind(this))
    router.post('/cms/:contentType/element/:elementId?', Schema.Api.CreateElement, this.createElement.bind(this))
    router.get('/cms/element/:elementId', Schema.Api.GetElement, this.getElement.bind(this))
    router.post('/cms/elements/bulk_delete', Schema.Api.BulkDelete, this.bulkDelete.bind(this))
  }

  async listTypes(req: Request, res: Response) {
    res.send({ registered: await this.cms.listTypes(), unregistered: [] })
  }

  async listElements(req: Request, res: Response) {
    const { contentType } = req.params
    const { searchTerm, from, count, ids } = req.body

    let elements = await this.cms.listElements()

    if (contentType) {
      elements = elements.filter((x) => x.contentType === contentType)
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

  async createElement(req: Request, res: Response) {
    const { contentType, elementId } = req.params
    const { formData } = req.body

    const id = elementId || req.body.id || `${contentType.replace('#', '')}-${nanoid(6)}`
    await this.cms.updateElement(contentType, {
      id,
      modifiedOn: new Date(),
      formData
    })

    res.send(id)
  }

  async getElement(req: Request, res: Response) {
    const { elementId } = req.params
    res.send(await this.cms.getElement(elementId))
  }

  async bulkDelete(req: Request, res: Response) {
    const { ids } = req.body
    await this.cms.deleteElements(ids)

    res.sendStatus(200)
  }
}
