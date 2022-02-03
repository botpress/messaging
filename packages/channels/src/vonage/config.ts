import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface VonageConfig extends ChannelConfig {
  apiKey: string
  signatureSecret: string
}

export const VonageConfigSchema = {
  apiKey: Joi.string().required(),
  signatureSecret: Joi.string().required()
}
