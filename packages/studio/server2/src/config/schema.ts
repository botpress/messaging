import { ReqSchema } from '@botpress/framework'
import Joi from 'joi'

const ConfigSchema = {
  name: Joi.string().required(),
  disabled: Joi.boolean().required(), // TODO: Remove this config
  private: Joi.boolean(), // TODO: Remove this config
  description: Joi.string().allow(''),
  defaultLanguage: Joi.string().required(),
  languages: Joi.array().items(Joi.string()).required(),
  details: Joi.object().keys({
    website: Joi.string().allow(''),
    phoneNumber: Joi.string().allow(''),
    emailAddress: Joi.string().allow(''),
    termsConditions: Joi.string().allow(''),
    privacyPolicy: Joi.string().allow(''),
    avatarUrl: Joi.string().allow(''),
    coverPictureUrl: Joi.string().allow('')
  })
}

const Api = {
  Get: ReqSchema(),
  Update: ReqSchema({ body: ConfigSchema })
}

export const Schema = { Api }
