import Joi from 'joi'

export interface DiscordConfig {
  token: string
}

export const DiscordConfigSchema = Joi.object({
  token: Joi.string().required()
}).options({ stripUnknown: true })
