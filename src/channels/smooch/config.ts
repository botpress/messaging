import Joi from 'joi'

export interface SmoochConfig {
  keyId: string
  secret: string
}

export const SmoochConfigSchema = Joi.object({
  keyId: Joi.string().required(),
  secret: Joi.string().required()
})
