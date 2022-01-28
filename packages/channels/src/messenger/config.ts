import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface MessengerConfig extends ChannelConfig {
  // TODO
}

export const MessengerConfigSchema = Joi.object({
  // TODO
}).options({ stripUnknown: true })
