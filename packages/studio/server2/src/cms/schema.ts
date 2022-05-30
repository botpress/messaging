import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  ListTypes: ReqSchema(),
  ListElements: ReqSchema({ body: { ids: Joi.array().items(Joi.string()).optional() } })
}

export const Schema = { Api }
