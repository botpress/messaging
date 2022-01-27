import { Channel } from '@botpress/messaging-channels'
import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const SyncWebhookSchema = Joi.object({
  url: Joi.string().uri().required()
})

export const makeSyncRequestSchema = (channels: Channel[]) => {
  const channelsSchema: { [name: string]: Joi.AlternativesSchema } = {}
  const channelsByName: { [name: string]: Channel[] } = {}

  for (const channel of channels) {
    if (!channelsByName[channel.meta.name]) {
      channelsByName[channel.meta.name] = []
    }
    channelsByName[channel.meta.name].push(channel)
  }

  for (const [name, channels] of Object.entries(channelsByName)) {
    channelsSchema[name] = Joi.alternatives().try(
      ...channels.map((x) =>
        Joi.object({ version: Joi.string().valid(x.meta.version).required(), ...x.meta.schema }).options({
          stripUnknown: true
        })
      )
    )
  }

  return ReqSchema({
    body: {
      channels: Joi.object(channelsSchema).allow(null),
      webhooks: Joi.array().items(SyncWebhookSchema).allow(null)
    }
  }).options({ stripUnknown: true })
}
