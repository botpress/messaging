import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface SlackConfig extends ChannelConfig {
  token: string
  signingSecret: string
}

export const SlackConfigSchema = {
  token: Joi.string().required(),
  signingSecret: Joi.string().required()
}
