import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface TwilioConfig extends ChannelConfig {
  accountSID: string
  authToken: string
  messageDelay?: string
  retryMaxAttempts?: number
  retryDelay?: string
}

export const TwilioConfigSchema = {
  accountSID: Joi.string().regex(/^AC.*/).required(),
  authToken: Joi.string().required(),
  messageDelay: Joi.string().optional(),
  retryMaxAttempts: Joi.number().optional(),
  retryDelay: Joi.string().optional()
}
