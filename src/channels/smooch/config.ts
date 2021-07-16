import Joi from 'joi'

export interface SmoochConfig {
  keyId: string
  secret: string
  webhookUrl?: string
}

export const SmoochConfigSchema = Joi.object({
  keyId: Joi.string().required(),
  secret: Joi.string().required(),
  webhookUrl: Joi.string().optional()
})
