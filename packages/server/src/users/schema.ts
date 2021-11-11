import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema(),

  Get: ReqSchema({
    params: { id: Joi.string().guid().required() }
  })
}

const Socket = {
  Get: Joi.object({}).required(),

  Auth: Joi.object({
    clientId: Joi.string().guid().required(),
    userId: Joi.string().guid().optional(),
    userToken: Joi.string().optional()
  })
}

export const Schema = { Api, Socket }
