import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const EntitySchema = {
  id: Joi.string(),
  name: Joi.string().required(),
  type: Joi.string().valid('system', 'pattern', 'list').required(),
  sensitive: Joi.boolean(),
  fuzzy: Joi.number(),
  matchCase: Joi.boolean(),
  examples: Joi.array().items(Joi.string()),
  occurrences: Joi.array().items(
    Joi.object().keys({
      name: Joi.string().required(),
      synonyms: Joi.array().items(Joi.string())
    })
  ),
  pattern: Joi.string().allow(''),
  label: Joi.string().optional()
}

const Api = {
  List: ReqSchema(),
  Create: ReqSchema({
    body: EntitySchema
  }),
  Update: ReqSchema({ params: { id: Joi.string().required() }, body: EntitySchema }),
  Delete: ReqSchema({ params: { id: Joi.string().required() } })
}

export const Schema = { Api }
