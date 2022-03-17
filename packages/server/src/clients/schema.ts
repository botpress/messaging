import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Get: ReqSchema(),

  Create: ReqSchema({ body: { id: Joi.string().uuid().optional() } }),

  Sync: ReqSchema({
    body: { id: Joi.string().optional(), token: Joi.string().optional(), name: Joi.string().required() }
  })
}

export const Schema = { Api }
