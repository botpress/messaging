import joi from 'joi'

export const Schemas = {
  UserNew: joi
    .object({
      userId: joi.string().guid().required()
    })
    .required() as any,

  ConversationStarted: joi
    .object({
      userId: joi.string().guid().required(),
      conversationId: joi.string().guid().required(),
      channel: joi.string().required()
    })
    .required() as any,

  MessageNew: joi
    .object({
      userId: joi.string().guid().required(),
      conversationId: joi.string().guid().required(),
      channel: joi.string().required(),
      collect: joi.boolean().optional(),
      message: joi
        .object({
          id: joi.string().guid().required(),
          conversationId: joi.string().guid().required(),
          authorId: joi.string().guid().required(),
          sentOn: joi.date().required(),
          payload: joi.object().required()
        })
        .required()
    })
    .required() as any
}
