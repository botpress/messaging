import { Message } from '@botpress/messaging-client'
import { Emitter } from './base/emitter'

export enum WebchatEvents {
  Setup = 'setup',
  Auth = 'auth',
  Messages = 'messages'
}

export class WebchatEmitter extends Emitter<{
  [WebchatEvents.Setup]: null
  [WebchatEvents.Auth]: null
  [WebchatEvents.Messages]: Message[]
}> {}

export type WebchatWatcher = Omit<WebchatEmitter, 'emit'>
