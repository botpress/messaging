import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema({
    body: { userId: Joi.string().guid().required() }
  }),

  Get: ReqSchema({
    params: { id: Joi.string().guid().required() }
  }),

  List: ReqSchema({
    params: { userId: Joi.string().guid().required() },
    query: { limit: Joi.number().min(0).optional() }
  })
}

const Socket = {
  Create: Joi.object({}).required(),

  Get: Joi.object({
    id: Joi.string().guid().required()
  }).required(),

  List: Joi.object({
    limit: Joi.number().required()
  }).required(),

  Delete: Joi.object({
    id: Joi.string().guid().required()
  }).required()
}

export const Schema = { Api, Socket }
