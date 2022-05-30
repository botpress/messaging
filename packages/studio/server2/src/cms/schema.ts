import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  ListTypes: ReqSchema(),
  ListElements: ReqSchema({
    params: {
      contentType: Joi.string()
    },
    body: {
      count: Joi.number(),
      from: Joi.number(),
      searchTerm: Joi.string().allow(''),
      sortOrder: Joi.array(),
      ids: Joi.array().items(Joi.string()).optional()
    }
  })
}

export const Schema = { Api }
