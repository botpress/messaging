import { Emitter, Message } from '@botpress/messaging-base'

export enum MessagesEvents {
  Receive = 'receive',
  Send = 'send'
}

export class MessagesEmitter extends Emitter<{
  [MessagesEvents.Receive]: Message[]
  [MessagesEvents.Send]: any
}> {}

export type MessagesWatcher = Omit<MessagesEmitter, 'emit'>
