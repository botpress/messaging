import { SyncChannels, SyncWebhook } from '@botpress/messaging-base'
import { Response } from 'express'
import Joi from 'joi'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { ChannelService } from '../channels/service'
import { Schema } from './schema'
import { SyncService } from './service'

const LEGACY_VERSION = '0.1.0'

export class SyncApi {
  constructor(private syncs: SyncService, private channels: ChannelService) {}

  setup(router: ApiManager) {
    router.post('/sync', Schema.Api.Sync, this.sync.bind(this))
  }

  async sync(req: ClientApiRequest, res: Response) {
    const webhooks: SyncWebhook[] = req.body.webhooks
    const channels: SyncChannels = req.body.channels

    for (const [name, config] of Object.entries(channels)) {
      const channel = this.channels.getByNameAndVersion(name, config?.version || LEGACY_VERSION)

      const { error, value } = Joi.object({
        body: {
          [channel.meta.name]: {
            version:
              channel.meta.version === LEGACY_VERSION
                ? Joi.string().valid(channel.meta.version).optional()
                : Joi.string().valid(channel.meta.version).required(),
            enabled: Joi.boolean().optional(),
            ...channel.meta.schema
          }
        }
      })
        .options({ stripUnknown: channel.meta.version === LEGACY_VERSION })
        .validate({ body: { [channel.meta.name]: config } })

      if (error) {
        return res.status(400).send(error.message)
      } else if (channels[name].enabled !== false) {
        channels[name] = { version: channel.meta.version, ...value.body[channel.meta.name] }
      } else {
        delete channels[name]
      }
    }

    const result = await this.syncs.sync(req.clientId, { webhooks, channels })
    res.send(result)
  }
}
