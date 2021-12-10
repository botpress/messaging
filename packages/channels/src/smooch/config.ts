import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface SmoochConfig extends ChannelConfig {
  keyId: string
  secret: string
  forwardRawPayloads?: string[]
}

export const SmoochConfigSchema = Joi.object({
  keyId: Joi.string().required(),
  secret: Joi.string().required(),
  forwardRawPayloads: Joi.array().items(Joi.string()).optional()
}).options({ stripUnknown: true })
