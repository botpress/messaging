import Joi from 'joi'

export interface TwilioConfig {
  accountSID: string
  authToken: string
}

export const TwilioConfigSchema = Joi.object({
  accountSID: Joi.string().required(),
  authToken: Joi.string().required()
}).options({ stripUnknown: true })
