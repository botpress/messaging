import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface TwilioConfig extends ChannelConfig {
  accountSID: string
  authToken: string
}

export const TwilioConfigSchema = {
  accountSID: Joi.string().regex(/AC.*/).required(),
  authToken: Joi.string().required()
}
