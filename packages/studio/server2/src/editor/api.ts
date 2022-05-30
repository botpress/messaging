import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { EditorService } from './service'

export class EditorApi {
  constructor(private editor: EditorService) {}

  setup(router: PublicApiManager) {
    router.get('/code-editor/files', Schema.Api.ListFiles, this.listFiles.bind(this))
    router.get('/code-editor/permissions', Schema.Api.GetPermissions, this.getPermissions.bind(this))
    // TODO: no typings at the moment
    router.get('/code-editor/typings', Schema.Api.GetTypings, this.getTypings.bind(this))
    router.post('/code-editor/readFile', Schema.Api.ReadFile, this.readFile.bind(this))
  }

  async listFiles(req: Request, res: Response) {
    res.send({ 'bot.hooks': await this.editor.listHooks(), 'bot.actions': await this.editor.listActions() })
  }

  async getPermissions(req: Request, res: Response) {
    res.send(await this.editor.getPermissions())
  }

  async getTypings(req: Request, res: Response) {
    res.send(await this.editor.getTypings())
  }

  async readFile(req: Request, res: Response) {
    res.send({ fileContent: await this.editor.readFile(req.body) })
  }
}
