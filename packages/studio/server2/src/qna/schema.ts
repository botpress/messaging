import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  List: ReqSchema({ query: { limit: Joi.number(), offset: Joi.number(), question: Joi.string().allow('') } }),
  Usage: ReqSchema()
}

export const Schema = { Api }
