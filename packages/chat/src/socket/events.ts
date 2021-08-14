import { Emitter } from '@botpress/messaging-base'

export enum SocketEvents {
  Message = 'message'
}

export interface SocketMessageEvent {
  type: string
  data: any
}

export class SocketEmitter extends Emitter<{
  [SocketEvents.Message]: SocketMessageEvent
}> {}

export type SocketWatcher = Omit<SocketEmitter, 'emit'>
