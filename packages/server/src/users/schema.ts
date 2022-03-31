import { ReqSchema } from '@botpress/messaging-framework'
import Joi from 'joi'

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
