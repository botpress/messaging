import Joi from 'joi'

const Api = {
  Create: Joi.object({
    userId: Joi.string().guid().required()
  }),

  Get: Joi.object({
    id: Joi.string().guid().required()
  }),

  List: Joi.object({
    query: Joi.object({ limit: Joi.number().optional() }).optional(),
    params: Joi.object({ id: Joi.string().guid().required() }).required()
  }),

  Recent: Joi.object({
    id: Joi.string().guid().required()
  })
}

const Socket = {
  Create: Joi.object({}),

  Get: Joi.object({
    id: Joi.string().guid().required()
  }),

  List: Joi.object({
    limit: Joi.number().required()
  }),

  Delete: Joi.object({
    id: Joi.string().guid().required()
  })
}

export const Schema = { Api, Socket }
