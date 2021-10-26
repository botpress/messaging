import Joi from 'joi'
import { ReqSchema } from '../base/schema'

const Api = {
  Create: ReqSchema({
    body: {
      conversationId: Joi.string().guid().required(),
      authorId: Joi.string().guid().optional(),
      payload: Joi.object().required()
    }
  }),

  Collect: ReqSchema({
    body: {
      conversationId: Joi.string().guid().required(),
      authorId: Joi.string().guid().required(),
      payload: Joi.object().required()
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
      limit: Joi.number().optional()
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
  })
}

const Socket = {
  Create: Joi.object({
    conversationId: Joi.string().guid().required(),
    payload: Joi.object().required()
  }).required(),

  List: Joi.object({
    conversationId: Joi.string().guid().required(),
    limit: Joi.number().required()
  }).required()
}

export const Schema = { Api, Socket }
