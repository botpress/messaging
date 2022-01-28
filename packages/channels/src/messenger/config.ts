import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface MessengerConfig extends ChannelConfig {
  appId: string
  appSecret: string
  verifyToken: string
  pageId: string
  accessToken: string
}

export const MessengerConfigSchema = {
  appId: Joi.string().required(),
  appSecret: Joi.string().required(),
  verifyToken: Joi.string().required(),
  pageId: Joi.string().required(),
  accessToken: Joi.string().required()
}
