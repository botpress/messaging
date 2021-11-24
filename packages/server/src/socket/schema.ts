import Joi from 'joi'

const Socket = {
  Auth: Joi.object({
    clientId: Joi.string().guid().required(),
    creds: Joi.object({
      userId: Joi.string().guid().required(),
      userToken: Joi.string().required()
    }).optional()
  }).required()
}

export const Schema = { Socket }
