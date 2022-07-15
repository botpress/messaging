import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  Get: ReqSchema({ params: { name: Joi.string() } }),
  Create: ReqSchema({
    body: {
      name: Joi.string(),
      // TODO: better validation
      utterances: Joi.object(),
      slots: Joi.array(),
      contexts: Joi.array()
    }
  }),
  List: ReqSchema(),
  ListContexts: ReqSchema()
}

export const Schema = { Api }
