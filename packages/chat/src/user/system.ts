import { User } from '@botpress/messaging-client'
import { UserEmitter, UserEvents, UserWatcher } from './events'

export class WebchatUser {
  public readonly events: UserWatcher
  public current?: User

  private emitter: UserEmitter

  constructor() {
    this.emitter = new UserEmitter()
    this.events = this.emitter
  }

  public async set(value: User) {
    const previous = this.current
    this.current = value
    await this.emitter.emit(UserEvents.Set, { previous, value })
  }
}
