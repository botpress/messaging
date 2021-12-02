import Joi from 'joi'

export class TelegramConfig {
  botToken!: string
}

export const TelegramConfigSchema = Joi.object({
  botToken: Joi.string().required()
}).options({ stripUnknown: true })
