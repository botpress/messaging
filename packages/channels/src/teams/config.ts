import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface TeamsConfig extends ChannelConfig {
  appId: string
  appPassword: string
  tenantId?: string
  proactiveMessages?: {
    [Key: string]: string
  }
}

export const TeamsConfigSchema = Joi.object({
  appId: Joi.string().required(),
  appPassword: Joi.string().required(),
  tenantId: Joi.string().optional(),
  proactiveMessages: Joi.object().optional()
}).options({ stripUnknown: true })
