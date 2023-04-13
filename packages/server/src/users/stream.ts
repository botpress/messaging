import { Streamer } from '../base/streamer'
import { UserCreatedEvent, UserUpdatedEvent, UserEvents } from './events'
import { UserService } from './service'

export class UserStream {
  constructor(private streamer: Streamer, private users: UserService) {}

  async setup() {
    this.users.events.on(UserEvents.Created, this.handleUserCreated.bind(this))
    this.users.events.on(UserEvents.Updated, this.handleUserUpdated.bind(this))
  }

  private async handleUserCreated({ user }: UserCreatedEvent) {
    await this.streamer.stream('user.new', { userData: user.data }, user.clientId, user.id)
  }

  private async handleUserUpdated({ user }: UserUpdatedEvent) {
    await this.streamer.stream('user.updated', { userData: user.data }, user.clientId, user.id)
  }
}
