import Joi from 'joi'
import { ChannelConfig } from '../base/config'

export interface MessengerConfig extends ChannelConfig {
  accessToken: string
  appSecret: string
  verifyToken: string
  disabledActions?: MessengerAction[]
  greeting?: string
  getStarted?: string
  persistentMenu?: PersistentMenuItem[]
}

export type MessengerAction = 'typing_on' | 'typing_off' | 'mark_seen'

export interface PersistentMenuItem {
  locale: string
  composer_input_disabled?: boolean
  call_to_actions?: CallToAction[] | null
}

export type CallToAction = WebUrlButton | PostbackButton | NestedButton

export interface WebUrlButton {
  type: 'web_url'
  url: string
  title: string
}

export interface PostbackButton {
  type: 'postback'
  title: string
  payload: string
}

export interface NestedButton {
  type: 'nested'
  title: string
  call_to_actions: CallToAction[]
}

export const MessengerConfigSchema = Joi.object({
  accessToken: Joi.string().required(),
  appSecret: Joi.string().required(),
  verifyToken: Joi.string().required(),
  disabledActions: Joi.array().items(Joi.string().valid('typing_on', 'typing_off', 'mark_seen')).optional(),
  greeting: Joi.string().optional(),
  getStarted: Joi.string().optional(),
  persistentMenu: Joi.array().optional()
}).options({ stripUnknown: true })
