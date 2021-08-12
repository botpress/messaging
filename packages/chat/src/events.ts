import { Message } from '@botpress/messaging-client'
import { Emitter } from './emitter'

export enum WebchatEvents {
  Setup = 'setup',
  Authenticated = 'authenticated',
  Messages = 'messages'
}

export class WebchatEmitter extends Emitter<{
  [WebchatEvents.Setup]: null
  [WebchatEvents.Authenticated]: null
  [WebchatEvents.Messages]: Message[]
}> {}

export type WebchatWatcher = Omit<WebchatEmitter, 'emit'>
