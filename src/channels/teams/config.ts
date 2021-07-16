import Joi from 'joi'

export interface TeamsConfig {
  appId: string
  appPassword: string
  tenantId: string
  proactiveMessages?: {
    [Key: string]: string
  }
}

export const TeamsConfigSchema = Joi.object({
  appId: Joi.string().required(),
  appPassword: Joi.string().required(),
  tenantId: Joi.string().optional(),
  proactiveMessages: Joi.object().optional()
})
