import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  List: ReqSchema(),
  Create: ReqSchema({ body: { flow: Joi.object().required() } }),
  Update: ReqSchema({ params: { name: Joi.string().required() }, body: { flow: Joi.object().required() } })
}

export const Schema = { Api }
