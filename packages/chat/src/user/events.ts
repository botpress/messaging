import { Emitter, uuid } from '@botpress/messaging-base'
import { UserInfo } from '@botpress/messaging-socket'

export enum UserEvents {
  Choose = 'choose',
  Set = 'set'
}

export interface UserSetEvent {
  previous: UserInfo | undefined
  value: UserInfo | undefined
}

export interface UserChooseEvent {
  choice: UserInfo | undefined
}

export class UserEmitter extends Emitter<{
  [UserEvents.Set]: UserSetEvent
  [UserEvents.Choose]: UserChooseEvent
}> {}

export type UserWatcher = Omit<UserEmitter, 'emit'>
