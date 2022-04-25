import joi from 'joi'

// we put as any here, because joi changed their typings at some version,
// and having the joi typings here might created unecessary incompatibilites.

/**
 * Schemas for the webhook events
 */
export const Schemas = {
  UserNew: joi
    .object({
      userId: joi.string().uuid().required()
    })
    .required()
    .options({ stripUnknown: true }) as any,

  ConversationStarted: joi
    .object({
      userId: joi.string().uuid().required(),
      conversationId: joi.string().uuid().required(),
      channel: joi.string().required()
    })
    .required()
    .options({ stripUnknown: true }) as any,

  MessageNew: joi
    .object({
      userId: joi.string().uuid().required(),
      conversationId: joi.string().uuid().required(),
      channel: joi.string().required(),
      collect: joi.boolean().optional(),
      message: joi
        .object({
          id: joi.string().uuid().required(),
          conversationId: joi.string().uuid().required(),
          authorId: joi.string().uuid().optional(),
          sentOn: joi.date().required(),
          payload: joi.object().required()
        })
        .required()
    })
    .required()
    .options({ stripUnknown: true }) as any,

  MessageFeedback: joi
    .object({
      userId: joi.string().uuid().required(),
      conversationId: joi.string().uuid().required(),
      channel: joi.string().required(),
      messageId: joi.string().uuid().required(),
      feedback: joi.number().allow(1, -1)
    })
    .required()
    .options({ stripUnknown: true }) as any
}
