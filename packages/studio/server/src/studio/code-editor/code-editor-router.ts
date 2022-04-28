import { StudioServices } from '../studio-router'
import { CustomStudioRouter } from '../utils/custom-studio-router'

import { Editor } from './editor'

const permissions = {
  'bot.hooks': {
    type: 'hook',
    isGlobal: false,
    read: true,
    write: true
  },
  'bot.actions': {
    type: 'action_legacy',
    isGlobal: false,
    read: true,
    write: true
  }
  // 'bot.components': {
  //   type: 'components',
  //   isGlobal: false,
  //   read: true,
  //   write: true
  // }
}

export class CodeEditorRouter extends CustomStudioRouter {
  constructor(services: StudioServices) {
    super('CodeEditor', services.logger, services.nlu)
    this.setupRoutes()
  }

  setupRoutes() {
    const router = this.router

    const editor = new Editor(this.logger)

    router.get(
      '/files',
      this.checkTokenHeader,
      this.needPermissions('read', 'bot.files'),
      this.asyncMiddleware(async (req: any, res) => {
        // TODO: params.botId doesn't exist anymore
        // TODO: remove "include builtin" param from UI

        res.send(await editor.forBot(req.params.botId).getAllFiles(permissions, false))
      })
    )

    router.post(
      '/save',
      this.checkTokenHeader,
      this.needPermissions('write', 'bot.files'),
      this.asyncMiddleware(async (req: any, res) => {
        await editor.forBot(req.params.botId).saveFile(req.body)
        res.sendStatus(200)
      })
    )

    router.post(
      '/readFile',
      this.checkTokenHeader,
      this.needPermissions('read', 'bot.files'),
      this.asyncMiddleware(async (req: any, res) => {
        const fileContent = await editor.forBot(req.params.botId).readFileContent(req.body)
        res.send({ fileContent })
      })
    )

    router.post(
      '/download',
      this.checkTokenHeader,
      this.needPermissions('read', 'bot.files'),
      this.asyncMiddleware(async (req: any, res, next) => {
        const buffer = await editor.forBot(req.params.botId).readFileBuffer(req.body)

        res.setHeader('Content-Disposition', `attachment; filename=${req.body.name}`)
        res.setHeader('Content-Type', 'application/octet-stream')
        res.send(buffer)
      })
    )

    router.post(
      '/exists',
      this.checkTokenHeader,
      this.needPermissions('read', 'bot.files'),
      this.asyncMiddleware(async (req: any, res, next) => {
        res.send(await editor.forBot(req.params.botId).fileExists(req.body))
      })
    )

    router.post(
      '/rename',
      this.checkTokenHeader,
      this.needPermissions('write', 'bot.files'),
      this.asyncMiddleware(async (req: any, res) => {
        await editor.forBot(req.params.botId).renameFile(req.body.file, req.body.newName)
        res.sendStatus(200)
      })
    )

    router.post(
      '/remove',
      this.checkTokenHeader,
      this.needPermissions('write', 'bot.files'),
      this.asyncMiddleware(async (req: any, res, next) => {
        await editor.forBot(req.params.botId).deleteFile(req.body)
        res.sendStatus(200)
      })
    )

    router.get(
      '/permissions',
      this.checkTokenHeader,
      this.asyncMiddleware(async (req: any, res) => {
        res.send(permissions)
      })
    )

    router.get(
      '/typings',
      this.asyncMiddleware(async (req, res) => {
        res.send(await editor.forBot(req.params.botId).loadTypings())
      })
    )
  }
}
