import { Emitter, uuid } from '@botpress/framework'

export enum SocketEvents {
  UserConnected,
  UserDisconnected
}

export interface SocketUserEvent {
  userId: uuid
}

export class SocketEmitter extends Emitter<{
  [SocketEvents.UserConnected]: SocketUserEvent
  [SocketEvents.UserDisconnected]: SocketUserEvent
}> {}

export type SocketWatcher = Omit<SocketEmitter, 'emit'>
