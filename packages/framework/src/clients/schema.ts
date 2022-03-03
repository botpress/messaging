import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema({ body: { id: Joi.string().uuid().optional() } })
}

export const Schema = { Api }
