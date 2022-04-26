import { Serialize } from 'cerialize' // TODO: we don't use this lib
import doctrine from 'doctrine'
import _ from 'lodash'
import path from 'path'

import yn from 'yn'
import { LocalActionDefinition } from '../../common/typings'
import { StudioServices } from '../studio-router'
import { Instance } from '../utils/bpfs'
import { CustomStudioRouter } from '../utils/custom-studio-router'

export class ActionsRouter extends CustomStudioRouter {
  constructor(services: StudioServices) {
    super('Actions', services.logger)
  }

  setupRoutes() {
    const router = this.router
    router.get(
      '/',
      this.checkTokenHeader,
      this.needPermissions('read', 'bot.flows'),
      this.asyncMiddleware(async (req, res) => {
        const botId = req.params.botId

        const allFiles = await Instance.directoryListing('actions', {})
        const actionFiles = allFiles.filter((file) => file.endsWith('.js'))

        const actions = await Promise.map(actionFiles, async (file) => {
          const actionName = file.replace(/\.js$/i, '')
          const actionCode = await Instance.readFile(path.join('actions', file))
          return {
            name: actionName,
            legacy: true,
            scope: 'bot',
            ...extractMetadata(actionCode.toString())
          }
        })

        res.send(Serialize(actions))
      })
    )
  }
}

// Credit: https://stackoverflow.com/questions/35905181/regex-for-jsdoc-comments
const JSDocCommentRegex = /\/\*\*\s*\n([^\*]|(\*(?!\/)))*\*\//gi

type ActionMetadata = Pick<LocalActionDefinition, 'title' | 'category' | 'author' | 'description' | 'params' | 'hidden'>

const extractMetadata = (code: string): ActionMetadata => {
  const match = code.match(JSDocCommentRegex)
  const metadata: ActionMetadata = {
    title: '',
    category: '',
    description: '',
    author: '',
    hidden: false,
    params: []
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
    metadata.author = (author as any).description || ''
  }

  const category = _.find(extracted.tags, { title: 'category' })
  if (category) {
    metadata.category = (category as any).description || ''
  }

  const title = _.find(extracted.tags, { title: 'title' })
  if (title) {
    metadata.title = (title as any).description || ''
  }

  const hidden = _.find(extracted.tags, { title: 'hidden' })
  if (hidden) {
    metadata.hidden = yn((hidden as any).description) || false
  }

  metadata.params = _.filter(extracted.tags, { title: 'param' }).map((tag) => {
    const type: string = _.get(tag, 'type.name', '')
    const required = _.get(tag, 'type.type') !== doctrine.type.Syntax.OptionalType
    const def = _.get(tag, 'default', '')
    const name = _.get(tag, 'name', '')

    return {
      description: (tag as any).description || '',
      type,
      default: def,
      required,
      name
    }
  })

  return metadata
}
