import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface WhatsappConfig extends ChannelConfig {
  appId: string
  appSecret: string
  verifyToken: string
  accessToken: string
  phoneNumberId: string
}

export const WhatsappConfigSchema = {
  appId: Joi.string().required(),
  appSecret: Joi.string().required(),
  verifyToken: Joi.string().required(),
  accessToken: Joi.string().required(),
  phoneNumberId: Joi.string().required()
}
