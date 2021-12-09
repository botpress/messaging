import { Channel } from '@botpress/messaging-channels'
import Joi from 'joi'

const SyncWebhookSchema = Joi.object({
  url: Joi.string().uri().required(),
  token: Joi.string()
})

export const makeSyncRequestSchema = (channels: Channel[]) => {
  const channelsSchema: any = {}

  for (const channel of channels) {
    channelsSchema[channel.meta.name] = channel.meta.schema.optional()
  }

  return Joi.object({
    channels: Joi.object(channelsSchema).allow(null),
    webhooks: Joi.array().items(SyncWebhookSchema).allow(null),
    id: Joi.string().guid().allow(null),
    token: Joi.string().allow(null),
    name: Joi.string().allow(null)
  }).options({ stripUnknown: true })
}
