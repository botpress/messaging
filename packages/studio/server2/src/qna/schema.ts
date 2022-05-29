import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  List: ReqSchema({ query: { limit: Joi.number(), offset: Joi.number(), question: Joi.string().allow('') } })
}

export const Schema = { Api }
