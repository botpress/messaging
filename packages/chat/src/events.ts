import { Emitter, Message } from '@botpress/messaging-client'

export enum WebchatEvents {
  Setup = 'setup',
  Messages = 'messages'
}

export class WebchatEmitter extends Emitter<{
  [WebchatEvents.Setup]: null
  [WebchatEvents.Messages]: Message[]
}> {}

export type WebchatWatcher = Omit<WebchatEmitter, 'emit'>
