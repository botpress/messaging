import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Map: ReqSchema({
    body: {
      channel: Joi.object({
        name: Joi.string().required(),
        version: Joi.string().required()
      }).required(),
      identity: Joi.string().required(),
      sender: Joi.string().required(),
      thread: Joi.string().required()
    }
  })
}

export const Schema = { Api }
