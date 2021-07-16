import Joi from 'joi'

export interface TelegramConfig {
  botToken: string
  webhookUrl?: string
}

export const TelegramConfigSchema = Joi.object({
  botToken: Joi.string().required(),
  webhookUrl: Joi.string().optional()
})
