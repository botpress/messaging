import Joi from 'joi'

export interface ChannelMeta {
  id: string
  name: string
  initiable: boolean
  lazy: boolean
  schema: Joi.ObjectSchema
}
