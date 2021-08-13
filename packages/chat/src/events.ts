import { Emitter, Message } from '@botpress/messaging-client'

export enum WebchatEvents {
  Setup = 'setup',
  Messages = 'messages',
  Send = 'send'
}

export class WebchatEmitter extends Emitter<{
  [WebchatEvents.Setup]: null
  [WebchatEvents.Messages]: Message[]
  [WebchatEvents.Send]: any
}> {}

export type WebchatWatcher = Omit<WebchatEmitter, 'emit'>
