import { Streamer } from '../base/streamer'
import { UserCreatedEvent, UserEvents } from './events'
import { UserService } from './service'

export class UserStream {
  constructor(private streamer: Streamer, private users: UserService) {}

  async setup() {
    this.users.events.on(UserEvents.Created, this.handleUserCreated.bind(this))
  }

  private async handleUserCreated({ user }: UserCreatedEvent) {
    await this.streamer.stream('user.new', {}, user.clientId, user.id)
  }
}
