import Joi from 'joi'
import { MessengerAction, PersistentMenuItem } from './types'

export interface MessengerConfig {
  accessToken: string
  appSecret: string
  verifyToken: string
  disabledActions?: MessengerAction[]
  greeting?: string
  getStarted?: string
  persistentMenu?: PersistentMenuItem[]
}

export const MessengerConfigSchema = Joi.object({
  accessToken: Joi.string().required(),
  appSecret: Joi.string().required(),
  verifyToken: Joi.string().required(),
  disabledActions: Joi.array().items(Joi.string().valid('typing_on', 'typing_off', 'mark_seen')).optional(),
  greeting: Joi.string().optional(),
  getStarted: Joi.string().optional(),
  persistentMenu: Joi.array().optional()
})
