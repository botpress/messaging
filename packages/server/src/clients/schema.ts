import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema(),

  CreateNamed: ReqSchema({ body: { name: Joi.string().required() } })
}

export const Schema = { Api }
