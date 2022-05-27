import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  Create: ReqSchema({ body: { address: Joi.string().required() } }),

  Get: ReqSchema({
    params: { id: Joi.string().guid().required() }
  })
}

export const Schema = { Api }
