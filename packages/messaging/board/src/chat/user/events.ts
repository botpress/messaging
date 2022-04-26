import { Emitter } from '@botpress/messaging-base'
import { UserCredentials } from '@botpress/messaging-socket'

export enum UserEvents {
  Choose = 'choose',
  Set = 'set'
}

export interface UserSetEvent {
  previous: UserCredentials | undefined
  value: UserCredentials | undefined
}

export interface UserChooseEvent {
  choice: UserCredentials | undefined
}

export class UserEmitter extends Emitter<{
  [UserEvents.Set]: UserSetEvent
  [UserEvents.Choose]: UserChooseEvent
}> {}

export type UserWatcher = Omit<UserEmitter, 'emit'>
