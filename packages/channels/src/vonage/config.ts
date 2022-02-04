import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface VonageConfig extends ChannelConfig {
  apiKey: string
  apiSecret: string
  signatureSecret: string
  useTestingApi?: boolean
}

export const VonageConfigSchema = {
  apiKey: Joi.string().required(),
  apiSecret: Joi.string().required(),
  signatureSecret: Joi.string().required(),
  useTestingApi: Joi.boolean().optional()
}
