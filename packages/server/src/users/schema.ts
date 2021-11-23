import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema(),

  Get: ReqSchema({
    params: { id: Joi.string().guid().required() }
  })
}

const Socket = {
  Get: Joi.object({}).required()
}

export const Schema = { Api, Socket }
