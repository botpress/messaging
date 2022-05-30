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
      ids: Joi.array().items(Joi.string()).optional(),
      filters: Joi.array()
    }
  }),
  CreateElement: ReqSchema({
    params: { contentType: Joi.string().required(), elementId: Joi.string() },
    body: { formData: Joi.object().required() }
  }),
  GetElement: ReqSchema({ params: { elementId: Joi.string().required() } })
}

export const Schema = { Api }
