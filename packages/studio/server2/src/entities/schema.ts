import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  List: ReqSchema(),
  Create: ReqSchema({
    body: {
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
      pattern: Joi.string().allow('')
    }
  })
}

export const Schema = { Api }
