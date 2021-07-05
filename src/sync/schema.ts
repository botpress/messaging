import Joi from 'joi'

export const SyncWebhookSchema = Joi.object({
  url: Joi.string().required(),
  token: Joi.string()
})

export const SyncRequestSchema = Joi.object({
  channels: Joi.object().allow(null),
  webhooks: Joi.array().items(SyncWebhookSchema).allow(null),
  id: Joi.string().guid().allow(null),
  token: Joi.string().allow(null),
  name: Joi.string().allow(null)
})
