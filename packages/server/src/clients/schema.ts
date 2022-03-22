import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Get: ReqSchema(),

  Create: ReqSchema({ body: { id: Joi.string().uuid().optional() } }),

  Name: ReqSchema({ body: { id: Joi.string().uuid().required(), name: Joi.string().required() } })
}

export const Schema = { Api }
