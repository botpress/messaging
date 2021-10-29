import Joi from 'joi'

const Api = {
  Create: Joi.object({
    collect: Joi.boolean().optional(),
    conversationId: Joi.string().guid().required(),
    authorId: Joi.string().guid().optional(),
    payload: Joi.object().required(),
    incomingId: Joi.string().guid().optional(),
    timeout: Joi.number().min(0).optional()
  }),

  Turn: Joi.object({
    id: Joi.string().guid().required()
  }),

  Get: Joi.object({
    id: Joi.string().guid().required()
  }),

  List: Joi.object({
    conversationId: Joi.string().guid().required(),
    limit: Joi.number().required()
  }),

  Delete: Joi.object({
    id: Joi.string().guid().optional(),
    conversationId: Joi.string().guid().optional()
  })
}

const Socket = {
  Create: Joi.object({
    conversationId: Joi.string().guid().required(),
    payload: Joi.object().required()
  }),

  List: Joi.object({
    conversationId: Joi.string().guid().required(),
    limit: Joi.number().required()
  })
}

export const Schema = { Api, Socket }
