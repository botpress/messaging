import Joi from 'joi'

export interface MessengerConfig {
  accessToken: string
  appSecret: string
  verifyToken: string
}

export const MessengerConfigSchema = Joi.object({
  accessToken: Joi.string().required(),
  appSecret: Joi.string().required(),
  verifyToken: Joi.string().required()
})
