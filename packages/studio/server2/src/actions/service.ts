import { Service } from '@botpress/framework'
import doctrine from 'doctrine'
import { readFile } from 'fs/promises'
import _ from 'lodash'
import yn from 'yn'
import { PathService } from '../paths/service'

export class ActionService extends Service {
  constructor(private paths: PathService) {
    super()
  }

  async setup() {}

  async list() {
    const actions = await this.paths.listFilesRecursive('actions')

    return Promise.all(actions.map((x) => this.get(x)))
  }

  private async get(file: string) {
    const buffer = await readFile(this.paths.absolute(file))
    const code = buffer.toString()

    return {
      name: file.replace('actions/', '').replace('.js', ''),
      legacy: true,
      scope: 'bot',
      ...this.extractMetadata(code)
    }
  }

  private extractMetadata(code: string) {
    // https://stackoverflow.com/questions/35905181/regex-for-jsdoc-comments
    const jsdocRegex = /\/\*\*\s*\n([^\*]|(\*(?!\/)))*\*\//gi

    const match = code.match(jsdocRegex)
    const metadata = {
      title: '',
      category: '',
      description: '',
      author: '',
      hidden: false,
      params: [] as any[]
    }

    if (!match) {
      return metadata
    }

    const extracted = doctrine.parse(match[0], {
      recoverable: true,
      sloppy: true,
      unwrap: true,
      strict: false,
      preserveWhitespace: false
    })

    metadata.description = extracted.description

    const author = _.find(extracted.tags, { title: 'author' })
    if (author) {
      metadata.author = author.description || ''
    }

    const category = _.find(extracted.tags, { title: 'category' })
    if (category) {
      metadata.category = category.description || ''
    }

    const title = _.find(extracted.tags, { title: 'title' })
    if (title) {
      metadata.title = title.description || ''
    }

    const hidden = _.find(extracted.tags, { title: 'hidden' })
    if (hidden) {
      metadata.hidden = yn(hidden.description) || false
    }

    metadata.params = _.filter(extracted.tags, { title: 'param' }).map((tag) => {
      const type: string = _.get(tag, 'type.name', '')
      const required = _.get(tag, 'type.type') !== doctrine.type.Syntax.OptionalType
      const def = _.get(tag, 'default', '')
      const name = _.get(tag, 'name', '')

      return {
        description: tag.description || '',
        type,
        default: def,
        required,
        name
      }
    })

    return metadata
  }
}
