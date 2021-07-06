import Joi from 'joi'

export const CreateMsgSchema = Joi.object({
  conversationId: Joi.string().guid().required(),
  // TODO: should be uuid
  authorId: Joi.string().optional(),
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
