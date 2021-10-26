import Joi from 'joi'

const Api = {
  Get: Joi.object({
    id: Joi.string().guid().required()
  })
}

const Socket = {
  Get: Joi.object({}),

  Auth: Joi.object({
    clientId: Joi.string().guid().required(),
    id: Joi.string().guid().optional(),
    token: Joi.string().optional()
  })
}

export const Schema = { Api, Socket }
