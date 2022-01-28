import { SyncChannels, SyncRequest, SyncWebhook } from '@botpress/messaging-base'
import { Response } from 'express'
import Joi from 'joi'
import _ from 'lodash'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { ChannelService } from '../channels/service'
import { makeSyncRequestSchema } from './schema'
import { SyncService } from './service'

const LEGACY_VERSION = '0.1.0'

export class SyncApi {
  constructor(private syncs: SyncService, private channels: ChannelService) {}

  setup(router: ApiManager) {
    router.post('/sync', makeSyncRequestSchema(this.channels.list()), this.sync.bind(this))
  }

  async sync(req: ClientApiRequest, res: Response) {
    const { value, error } = this.validate(req.body)
    if (error) {
      return res.status(400).send(error.message)
    }

    const result = await this.syncs.sync(req.clientId, value!)
    res.send(result)
  }

  validate(req: SyncRequest): { value?: SyncRequest; error?: Joi.ValidationError } {
    const webhooks: SyncWebhook[] = req.webhooks || []
    const channels: SyncChannels = req.channels || {}

    for (const [name, config] of Object.entries(channels)) {
      const channel = this.channels.getByNameAndVersion(name, config?.version || LEGACY_VERSION)

      const { error, value } = Joi.object({
        body: {
          channels: {
            [channel.meta.name]: {
              version:
                channel.meta.version === LEGACY_VERSION
                  ? Joi.string().valid(channel.meta.version).optional()
                  : Joi.string().valid(channel.meta.version).required(),
              enabled: Joi.boolean().optional(),
              ...channel.meta.schema
            }
          }
        }
      })
        .options({ stripUnknown: channel.meta.version === LEGACY_VERSION, abortEarly: false })
        .validate({ body: { channels: { [channel.meta.name]: config } } })

      if (error) {
        return { error }
      } else if (channels[name].enabled !== false) {
        channels[name] = { version: channel.meta.version, ..._.omit(value.body.channels[channel.meta.name], 'enabled') }
      } else {
        delete channels[name]
      }
    }

    return { value: { webhooks, channels } }
  }
}
