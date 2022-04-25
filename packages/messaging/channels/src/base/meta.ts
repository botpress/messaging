import Joi from 'joi'

export interface ChannelMeta {
  id: string
  name: string
  version: string
  initiable: boolean
  lazy: boolean
  schema: { [field: string]: Joi.Schema }
}
