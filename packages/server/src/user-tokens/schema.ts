import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema({
    body: { userId: Joi.string().guid().required() }
  })
}

const Socket = {}

export const Schema = { Api, Socket }
