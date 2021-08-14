import { Emitter, User } from '@botpress/messaging-client'

export enum UserEvents {
  Set = 'set'
}

export interface UserSetEvent {
  previous: User | undefined
  value: User | undefined
}

export class UserEmitter extends Emitter<{
  [UserEvents.Set]: UserSetEvent
}> {}

export type UserWatcher = Omit<UserEmitter, 'emit'>
