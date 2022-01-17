import { Channel } from '@botpress/messaging-channels'
import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const SyncWebhookSchema = Joi.object({
  url: Joi.string().uri().required()
})

export const makeSyncRequestSchema = (channels: Channel[]) => {
  const channelsSchema: { [name: string]: Joi.ObjectSchema<any> } = {}

  for (const channel of channels) {
    channelsSchema[channel.meta.name] = channel.meta.schema.optional()
  }

  return ReqSchema({
    body: {
      channels: Joi.object(channelsSchema).allow(null),
      webhooks: Joi.array().items(SyncWebhookSchema).allow(null)
    }
  }).options({ stripUnknown: true })
}
