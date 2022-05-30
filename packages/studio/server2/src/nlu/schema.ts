import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  Info: ReqSchema(),
  Training: ReqSchema({ params: { lang: Joi.string().required() } })
}

export const Schema = { Api }
