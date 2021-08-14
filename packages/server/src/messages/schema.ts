import Joi from 'joi'

export const CreateMsgSchema = Joi.object({
  conversationId: Joi.string().guid().required(),
  authorId: Joi.string().guid().optional(),
  payload: Joi.object().required()
})

export const GetMsgSchema = Joi.object({
  id: Joi.string().guid().required()
})

export const ListMsgSchema = Joi.object({
  conversationId: Joi.string().guid().required(),
  limit: Joi.number().required()
})

export const DeleteMsgSchema = Joi.object({
  id: Joi.string().guid().optional(),
  conversationId: Joi.string().guid().optional()
})

export const CreateMsgSocketSchema = Joi.object({
  clientId: Joi.string().guid().required(),
  userId: Joi.string().guid().required(),
  conversationId: Joi.string().guid().required(),
  payload: Joi.object().required()
})

export const ListMsgSocketSchema = Joi.object({
  clientId: Joi.string().guid().required(),
  userId: Joi.string().guid().required(),
  conversationId: Joi.string().guid().required(),
  limit: Joi.number().required()
})
