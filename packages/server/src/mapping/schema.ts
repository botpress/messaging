import { Channel } from '@botpress/messaging-channels'
import Joi from 'joi'
import { ReqSchema } from '../base/schema'

export const makeMapRequestSchema = (channels: Channel[]) => {
  return ReqSchema({
    body: {
      channel: Joi.alternatives([
        Joi.string(),
        ...channels.map((x) =>
          Joi.object({
            name: Joi.string().valid(x.meta.name).required(),
            version: Joi.string().valid(x.meta.version).required()
          })
        )
      ]).required(),
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
