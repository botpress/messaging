import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface SlackConfig extends ChannelConfig {
  botToken: string
  signingSecret: string
}

export const SlackConfigSchema = {
  botToken: Joi.string().required(),
  signingSecret: Joi.string().required()
}
