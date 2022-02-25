import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema({
    body: {
      conversationId: Joi.string().guid().required(),
      authorId: Joi.string().guid().optional(),
      payload: Joi.object().required(),
      incomingId: Joi.string().guid().optional()
    }
  }),

  Collect: ReqSchema({
    body: {
      conversationId: Joi.string().guid().required(),
      authorId: Joi.string().guid().required(),
      payload: Joi.object().required(),
      timeout: Joi.number().min(0).max(50000).optional()
    }
  }),

  Get: ReqSchema({
    params: {
      id: Joi.string().guid().required()
    }
  }),

  List: ReqSchema({
    params: {
      conversationId: Joi.string().guid().required()
    },
    query: {
      limit: Joi.number().min(0).optional()
    }
  }),

  Delete: ReqSchema({
    params: {
      id: Joi.string().guid().required()
    }
  }),

  DeleteByConversation: ReqSchema({
    params: {
      conversationId: Joi.string().guid().required()
    }
  }),

  Turn: ReqSchema({
    params: {
      id: Joi.string().guid().required()
    }
  })
}

const Socket = {
  Create: Joi.object({
    conversationId: Joi.string().guid().required(),
    payload: Joi.object().required()
  }).required(),

  List: Joi.object({
    conversationId: Joi.string().guid().required(),
    limit: Joi.number().min(0).required()
  }).required(),

  Feedback: Joi.object({
    messageId: Joi.string().guid().required(),
    feedback: Joi.number().allow(-1, 1)
  }).required()
}

export const Schema = { Api, Socket }
