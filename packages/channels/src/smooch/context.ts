import { ChannelContext } from '../base/context'
import { SmoochState } from './service'

export type SmoochContext = ChannelContext<SmoochState> & {
  messages: any[]
}

export interface SmoochWebhook {
  _id: string
  /** Include client in payload */
  includeClient: boolean
  /** Include complete appUser in payload */
  includeFullAppUser: boolean
  /** Triggers that the webhook listens to */
  triggers: string[]
  /** Secret key generated for this webhook */
  secret: string
  /** URL to be called when the webhook is triggered */
  target: string
  version: '1.1'
}

export interface SmoochPayload {
  trigger: 'message:appUser' | 'message:appMaker'
  app: { _id: string }
  version: '1.1'
  messages: SmoochMessage[]
  postbacks: SmoochMessage[]
  appUser: SmoochAppUser
  conversation: { _id: string }
}

export interface SmoochAppUser {
  _id: string
  conversationStarted: boolean
  signedUpAt: Date
  properties: any
  surname?: string
  givenName?: string
  email?: string
}

export interface SmoochMessage {
  _id: string
  type: 'text' | 'image' | 'file' | 'carousel' | 'location' | 'list' | 'form' | 'formResponse'
  text: string
  role: 'appUser' | 'appMaker' | 'whisper'
  name: string
  authorId: string
  /** Unix timestamp for when Sunshine Conversations received the message */
  received: number
  source: {
    /** web, messenger, telegram, wechat, twilio, etc */
    type: string
  }
  action?: SmoochAction
}

export interface SmoochCard {
  title: string
  description: string
  actions: SmoochAction[]
  mediaUrl?: string
}

export interface SmoochAction {
  text: string
  type: string
  uri?: string
  payload?: string
}
