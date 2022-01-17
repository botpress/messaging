import { Response } from 'express'
import Joi from 'joi'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
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

  async sync(req: ClientApiRequest, res: Response) {
    const body = { ...req.body, channels: this.removeDisabledChannels(req.body.channels) }
    const { value } = this.schema.validate(body)

    const result = await this.syncs.sync(req.clientId, value)
    res.send(result)
  }

  private removeDisabledChannels(body: any) {
    const filtered: any = {}

    for (const [key, value] of Object.entries(body)) {
      if (body[key].enabled !== false) {
        filtered[key] = value
      }
    }

    return filtered
  }
}
