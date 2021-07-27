import Joi from 'joi'

export interface SlackConfig {
  botToken: string
  signingSecret: string
  useRTM: boolean
}

export const SlackConfigSchema = Joi.object({
  botToken: Joi.string().required(),
  signingSecret: Joi.string().required(),
  useRTM: Joi.boolean().optional()
}).options({ stripUnknown: true })
