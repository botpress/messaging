import { ReqSchema } from '@botpress/framework'
import { Channel } from '@botpress/messaging-channels'
import Joi from 'joi'

export const makeMapRequestSchema = (channels: Channel[]) => {
  return ReqSchema({
    body: {
      channel: Joi.alternatives(
        channels.map((x) =>
          Joi.object({
            name: Joi.string().valid(x.meta.name).required(),
            version: Joi.string().valid(x.meta.version).required()
          })
        )
      ).required(),
      identity: Joi.string().required(),
      sender: Joi.string().required(),
      thread: Joi.string().required()
    }
  })
}

const Api = {
  List: ReqSchema({
    params: {
      conversationId: Joi.string().guid().required()
    }
  })
}

export const Schema = { Api }
