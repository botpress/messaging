import { Service } from '@botpress/framework'
import path from 'path'
import { PathService } from '../paths/service'

export class CmsService extends Service {
  constructor(private paths: PathService) {
    super()
  }

  async setup() {}

  async list() {
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
}
