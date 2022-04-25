import Joi from 'joi'

interface SchemaObject {
  [key: string]: Joi.AnySchema
}

export const ReqSchema = (
  schema?: { body?: SchemaObject; params?: SchemaObject; query?: SchemaObject } | undefined
) => {
  return Joi.object({
    body: Joi.object(schema?.body || {}).required(),
    params: Joi.object(schema?.params || {}).required(),
    query: Joi.object(schema?.query || {}).required()
  }).required()
}
