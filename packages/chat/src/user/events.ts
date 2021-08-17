import { Emitter, User, uuid } from '@botpress/messaging-base'

export enum UserEvents {
  Choose = 'choose',
  Set = 'set'
}

export interface UserSetEvent {
  previous: User | undefined
  value: User | undefined
}

export interface UserChooseEvent {
  choice: uuid | undefined
}

export class UserEmitter extends Emitter<{
  [UserEvents.Set]: UserSetEvent
  [UserEvents.Choose]: UserChooseEvent
}> {}

export type UserWatcher = Omit<UserEmitter, 'emit'>
