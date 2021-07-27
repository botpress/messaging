import Joi from 'joi'
import { Channel } from '../channels/base/channel'

const SyncWebhookSchema = Joi.object({
  url: Joi.string().required(),
  token: Joi.string()
})

export const makeSyncRequestSchema = (channels: Channel<any>[]) => {
  const channelsSchema: any = {}

  for (const channel of channels) {
    channelsSchema[channel.name] = channel.schema.optional()
  }

  return Joi.object({
    channels: Joi.object(channelsSchema).allow(null),
    webhooks: Joi.array().items(SyncWebhookSchema).allow(null),
    id: Joi.string().guid().allow(null),
    token: Joi.string().allow(null),
    name: Joi.string().allow(null)
  }).options({ stripUnknown: true })
}
