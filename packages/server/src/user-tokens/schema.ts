import Joi from 'joi'

export const CreateUserTokenSchema = Joi.object({
  userId: Joi.string().guid().required()
})
