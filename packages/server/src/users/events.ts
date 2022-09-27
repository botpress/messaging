import { Emitter, User } from '@botpress/messaging-base'

export enum UserEvents {
  Created,
  Fetched
}

export interface UserCreatedEvent {
  user: User
}

export interface UserFetchedEvent {
  user: User
}

export class UserEmitter extends Emitter<{
  [UserEvents.Created]: UserCreatedEvent
  [UserEvents.Fetched]: UserFetchedEvent
}> {}

export type UserWatcher = Omit<UserEmitter, 'emit'>
