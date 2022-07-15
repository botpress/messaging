import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'
import { QnaService } from './service'

export class QnaApi {
  constructor(private qnas: QnaService) {}

  setup(router: PublicApiManager) {
    router.get('/qna/questions', Schema.Api.List, this.list.bind(this))
    // TODO: don't know what this is supposed to do
    router.get('/qna/contentElementUsage', Schema.Api.Usage, this.usage.bind(this))
  }

  async list(req: Request, res: Response) {
    const qnas = await this.qnas.list()
    res.send({ items: qnas, count: qnas.length })
  }

  async usage(req: Request, res: Response) {
    res.send({})
  }
}
