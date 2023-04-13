import { Emitter, User } from '@botpress/messaging-base'

export enum UserEvents {
  Created,
  Updated
}

export interface UserCreatedEvent {
  user: User
}

export interface UserUpdatedEvent {
  user: User
}

export class UserEmitter extends Emitter<{
  [UserEvents.Created]: UserCreatedEvent
  [UserEvents.Updated]: UserUpdatedEvent
}> {}

export type UserWatcher = Omit<UserEmitter, 'emit'>
