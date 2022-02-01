import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface SmoochConfig extends ChannelConfig {
  appId: string
  keyId: string
  keySecret: string
  webhookSecret: string
}

export const SmoochConfigSchema = {
  appId: Joi.string().required(),
  keyId: Joi.string().required(),
  keySecret: Joi.string().required(),
  webhookSecret: Joi.string().required()
}
