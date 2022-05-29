import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  Get: ReqSchema({ params: { name: Joi.string() } }),
  List: ReqSchema()
}

export const Schema = { Api }
