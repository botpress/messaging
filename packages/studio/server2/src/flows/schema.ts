import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  List: ReqSchema(),
  Update: ReqSchema({ params: { id: Joi.string().required() }, body: { flow: Joi.object().required() } })
}

export const Schema = { Api }
