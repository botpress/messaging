import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import path from 'path'
import { Schema } from './schema'
import { MediaService } from './service'

export class MediaApi {
  constructor(private media: MediaService) {}

  setup(router: PublicApiManager) {
    router.get('/media/:id', Schema.Api.Get, this.get.bind(this))
    router.post('/media', Schema.Api.Save, this.save.bind(this), { enableMultipartUpload: true })
  }

  async get(req: Request, res: Response) {
    const { id } = req.params
    res.send(await this.media.get(id))
  }

  async save(req: Request, res: Response) {
    if (Array.isArray((req as any).files)) {
      // TODO: Fix typings
      const file = (req as any).files[0]
      res.send(await this.media.save(file.buffer, path.extname(file.originalname)))
    } else {
      throw new Error('Media service can only handle single file uploads')
    }
  }
}
