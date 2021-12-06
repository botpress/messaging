import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface VonageConfig extends ChannelConfig {
  apiKey: string
  apiSecret: string
  signatureSecret: string
  applicationId: string
  privateKey: string
  useTestingApi?: boolean
}

export const VonageConfigSchema = Joi.object({
  apiKey: Joi.string().required(),
  apiSecret: Joi.string().required(),
  signatureSecret: Joi.string().required(),
  applicationId: Joi.string().required(),
  privateKey: Joi.string().required(),
  useTestingApi: Joi.boolean().optional()
}).options({ stripUnknown: true })
