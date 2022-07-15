import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  Get: ReqSchema(),
  Save: ReqSchema({ body: { file: Joi.any() } })
}

export const Schema = { Api }
