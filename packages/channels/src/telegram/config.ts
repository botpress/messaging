import Joi from 'joi'

export interface TelegramConfig {
  botToken: string
}

export const TelegramConfigSchema = {
  botToken: Joi.string().required()
}
