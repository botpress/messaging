import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Sync: ReqSchema({
    body: {
      channels: Joi.object().optional(),
      webhooks: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().uri().required()
          })
        )
        .allow(null)
    }
  })
}

export const Schema = { Api }
