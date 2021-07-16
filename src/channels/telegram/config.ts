import Joi from 'joi'

export interface TelegramConfig {
  botToken: string
}

export const TelegramConfigSchema = Joi.object({
  botToken: Joi.string().required()
})
