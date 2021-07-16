import Joi from 'joi'

export interface SmoochConfig {
  keyId: string
  secret: string
  forwardRawPayloads?: string[]
}

export const SmoochConfigSchema = Joi.object({
  keyId: Joi.string().required(),
  secret: Joi.string().required(),
  forwardRawPayloads: Joi.array().items(Joi.string()).optional()
})
