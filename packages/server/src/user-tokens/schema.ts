import { ReqSchema } from '@botpress/messaging-framework'
import Joi from 'joi'

const Api = {
  Create: ReqSchema({
    body: { userId: Joi.string().guid().required() }
  })
}

const Socket = {}

export const Schema = { Api, Socket }
