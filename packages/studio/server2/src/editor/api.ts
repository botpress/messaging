import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { EditorService } from './service'

export class EditorApi {
  constructor(private editor: EditorService) {}

  setup(router: PublicApiManager) {
    router.get('/code-editor/files', Schema.Api.ListFiles, this.listFiles.bind(this))
  }

  async listFiles(req: Request, res: Response) {
    res.send({ 'bot.hooks': await this.editor.listHooks(), 'bot.actions': await this.editor.listActions() })
  }
}
