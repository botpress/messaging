import Joi from 'joi'

export interface ServerMetaEntry {
  time: Date
  data: ServerMetadata
}

export interface ServerMetadata {
  version: string
}

export const ServerMetadataSchema = Joi.object({
  version: Joi.string().required()
}).required()
