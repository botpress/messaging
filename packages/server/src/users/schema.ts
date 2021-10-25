import Joi from 'joi'

export const GetUserSchema = Joi.object({
  id: Joi.string().guid().required()
})

export const GetUserSocketSchema = Joi.object({})

export const AuthUserSocketSchema = Joi.object({
  clientId: Joi.string().guid().required(),
  id: Joi.string().guid().optional(),
  token: Joi.string().optional()
})
