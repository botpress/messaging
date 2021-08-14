import { Emitter } from '@botpress/messaging-base'

export enum SocketComEvents {
  Message = 'message'
}

export interface SocketComMessageEvent {
  type: string
  data: any
}

export class SocketComEmitter extends Emitter<{
  [SocketComEvents.Message]: SocketComMessageEvent
}> {}

export type SocketComWatcher = Omit<SocketComEmitter, 'emit'>
