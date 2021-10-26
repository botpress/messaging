import Joi from 'joi'

const Api = {
  Create: Joi.object({
    conversationId: Joi.string().guid().required(),
    authorId: Joi.string().guid().optional(),
    payload: Joi.object().required()
  }),

  Collect: Joi.object({
    conversationId: Joi.string().guid().required(),
    authorId: Joi.string().guid().required(),
    payload: Joi.object().required()
  }),

  Get: Joi.object({
    id: Joi.string().guid().required()
  }),

  List: Joi.object({
    query: Joi.object({ limit: Joi.number().optional() }).optional(),
    params: Joi.object({ id: Joi.string().guid().required() }).required()
  }),

  Delete: Joi.object({
    id: Joi.string().guid().required()
  }),

  DeleteByConversation: Joi.object({
    id: Joi.string().guid().required()
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
