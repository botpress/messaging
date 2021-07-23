import Joi from 'joi'

export const ChatReplySchema = Joi.object({
  channel: Joi.string().required(),
  conversationId: Joi.string().guid().required(),
  payload: Joi.object().required()
})
