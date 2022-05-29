import { Service } from '@botpress/framework'
import _ from 'lodash'
import path from 'path'
import { FileService } from '../files/service'
import { PathService } from '../paths/service'

export class CmsService extends Service {
  private contentTypes!: any[]

  constructor(private paths: PathService, private files: FileService) {
    super()
  }

  async setup() {
    const contentTypesPathsWithUtils = await this.paths.listFiles('content-types')
    const contentTypesPaths = contentTypesPathsWithUtils.filter((x) => !path.basename(x).startsWith('_'))

    this.contentTypes = contentTypesPaths.map((x) => require(this.paths.absolute(x)).default)
  }

  async listTypes() {
    return this.contentTypes.map((x) => ({
      id: x.id,
      // TODO: count doesn't work
      count: undefined,
      title: x.title,
      hidden: x.hidden,
      schema: {
        json: x.jsonSchema,
        ui: x.uiSchema,
        title: x.title,
        renderer: x.id
      }
    }))
  }

  async listElements() {
    // TODO: missing preview

    const contentElementsPerFile = await this.files.list('content-elements')
    const contentElements = []

    for (const file of contentElementsPerFile) {
      const contentTypeId = path.basename(file.path).replace('.json', '')
      const contentType = this.contentTypes.find((x) => x.id === contentTypeId)

      for (const element of file.content) {
        contentElements.push({
          ...element,
          contentType: contentTypeId,
          schema: {
            json: contentType.jsonSchema,
            ui: contentType.uiSchema,
            title: contentType.title,
            renderer: contentType.id
          }
        })
      }
    }

    return _.sortBy(contentElements, 'createdOn')
  }
}
