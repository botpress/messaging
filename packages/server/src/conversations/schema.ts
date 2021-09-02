import Joi from 'joi'

export const CreateConvoSchema = Joi.object({
  userId: Joi.string().guid().required()
})

export const GetConvoSchema = Joi.object({
  id: Joi.string().guid().required()
})

export const ListConvosSchema = Joi.object({
  userId: Joi.string().guid().required(),
  limit: Joi.number().required()
})

export const RecentConvoSchema = Joi.object({
  userId: Joi.string().guid().required()
})

export const UseConvoSocketSchema = Joi.object({
  conversationId: Joi.string().guid().optional()
})
