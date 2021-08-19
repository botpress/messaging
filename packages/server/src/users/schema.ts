import Joi from 'joi'

export const AuthUserSocketSchema = Joi.object({
  clientId: Joi.string().guid().required(),
  userId: Joi.string().guid().optional(),
  userToken: Joi.string().optional()
})
