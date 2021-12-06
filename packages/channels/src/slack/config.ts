import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface SlackConfig extends ChannelConfig {
  botToken: string
  signingSecret: string
  useRTM: boolean
}

export const SlackConfigSchema = Joi.object({
  botToken: Joi.string().required(),
  signingSecret: Joi.string().required(),
  useRTM: Joi.boolean().optional()
}).options({ stripUnknown: true })
