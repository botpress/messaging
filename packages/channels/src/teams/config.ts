import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface TeamsConfig extends ChannelConfig {
  appId: string
  appPassword: string
}

export const TeamsConfigSchema = {
  appId: Joi.string().required(),
  appPassword: Joi.string().required()
}
