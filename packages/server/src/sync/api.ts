import { Request, Response } from 'express'
import Joi from 'joi'
import { ApiManager } from '../base/api-manager'
import { ChannelService } from '../channels/service'
import { makeSyncRequestSchema } from './schema'
import { SyncService } from './service'

export class SyncApi {
  private schema!: Joi.ObjectSchema

  constructor(private syncs: SyncService, private channels: ChannelService) {}

  setup(router: ApiManager) {
    this.schema = makeSyncRequestSchema(this.channels.list())
    router.post('/sync', this.schema, this.sync.bind(this))
  }

  async sync(req: Request, res: Response) {
    console.log('yo', req.body)
    const { value } = this.schema.validate(req.body)
    console.log('yoyo', value)

    const result = await this.syncs.sync(value)
    res.send(result)
  }
}
