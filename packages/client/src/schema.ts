import joi from 'joi'

// we put as any here, because joi changed their typings at some version,
// and having the joi typings here might created unecessary incompatibilites.

export const Schemas = {
  UserNew: joi
    .object({
      userId: joi.string().guid().required()
    })
    .required()
    .options({ stripUnknown: true }) as any,

  ConversationStarted: joi
    .object({
      userId: joi.string().guid().required(),
      conversationId: joi.string().guid().required(),
      channel: joi.string().required()
    })
    .required()
    .options({ stripUnknown: true }) as any,

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
    .required()
    .options({ stripUnknown: true }) as any
}
