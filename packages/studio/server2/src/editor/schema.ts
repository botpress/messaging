import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const Api = {
  ListFiles: ReqSchema(),
  GetPermissions: ReqSchema(),
  GetTypings: ReqSchema(),
  ReadFile: ReqSchema({
    body: {
      location: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().required(),
      hookType: Joi.string()
    }
  })
}

export const Schema = { Api }
