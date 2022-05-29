import { Service } from '@botpress/framework'
import _ from 'lodash'
import path from 'path'
import { FileService } from '../files/service'
import { PathService } from '../paths/service'

export class CmsService extends Service {
  constructor(private paths: PathService, private files: FileService) {
    super()
  }

  async setup() {}

  async listTypes() {
    const contentTypesPathsWithUtils = await this.paths.listFiles('content-types')
    const contentTypesPaths = contentTypesPathsWithUtils.filter((x) => !path.basename(x).startsWith('_'))

    const contentTypes = contentTypesPaths.map((x) => require(this.paths.absolute(x)).default)

    return contentTypes.map((x) => ({
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
    const contentElementsPerFile = await this.files.list('content-elements')
    const contentElements = []

    for (const file of contentElementsPerFile) {
      const contentType = path.basename(file.path).replace('.json', '')

      for (const element of file.content) {
        contentElements.push({
          ...element,
          contentType
        })
      }
    }

    return _.sortBy(contentElements, 'createdOn')
  }
}
