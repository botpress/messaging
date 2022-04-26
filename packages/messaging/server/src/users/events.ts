import { Emitter, User } from '@botpress/messaging-base'

export enum UserEvents {
  Created
}

export interface UserCreatedEvent {
  user: User
}

export class UserEmitter extends Emitter<{
  [UserEvents.Created]: UserCreatedEvent
}> {}

export type UserWatcher = Omit<UserEmitter, 'emit'>
