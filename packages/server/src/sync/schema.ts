import { Channel } from '@botpress/messaging-channels'
import Joi from 'joi'
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
    channelsSchema[name] = Joi.object({
      version: Joi.string()
        .valid(...channels.map((x) => x.meta.version))
        .optional()
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
