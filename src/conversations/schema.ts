import Joi from 'joi'

export const CreateConvoSchema = Joi.object({
  // TODO: should be uuid
  userId: Joi.string().required()
})

export const GetConvoSchema = Joi.object({
  id: Joi.string().guid().required()
})

export const ListConvosSchema = Joi.object({
  // TODO: should be uuid
  userId: Joi.string().required(),
  limit: Joi.number().required()
})

export const RecentConvoSchema = Joi.object({
  // TODO: should be uuid
  userId: Joi.string().required()
})
