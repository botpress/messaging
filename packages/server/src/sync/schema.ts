import { Channel } from '@botpress/messaging-channels'
import Joi from 'joi'
import yn from 'yn'
import { ReqSchema } from '../base/schema'

export const makeSyncRequestSchema = (channels: Channel[]) => {
  const channelsSchema: { [name: string]: Joi.ObjectSchema } = {}
  const channelsByName: { [name: string]: Channel[] } = {}

  for (const channel of channels) {
    if (!channelsByName[channel.meta.name]) {
      channelsByName[channel.meta.name] = []
    }
    channelsByName[channel.meta.name].push(channel)
  }

  for (const [name, channels] of Object.entries(channelsByName)) {
    const versionSchema = Joi.string().valid(...new Set(channels.map((x) => x.meta.version)))

    channelsSchema[name] = Joi.object({
      // when legacy channels are enable, not supplying the version defaults to 0.1.0
      version: yn(process.env.ENABLE_LEGACY_CHANNELS) ? versionSchema.optional() : versionSchema.required()
    })
      .options({
        allowUnknown: true
      })
      .optional()
  }

  return ReqSchema({
    body: {
      channels: Joi.object(channelsSchema).optional(),
      webhooks: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().uri().required()
          })
        )
        .optional()
    }
  })
}
