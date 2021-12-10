import { StreamService } from '../stream/service'
import { UserCreatedEvent, UserEvents } from './events'
import { UserService } from './service'

export class UserStream {
  constructor(private users: UserService, private stream: StreamService) {}

  async setup() {
    this.users.events.on(UserEvents.Created, this.handleUserCreated.bind(this))
  }

  private async handleUserCreated({ user }: UserCreatedEvent) {
    await this.stream.stream('user.new', {}, user.clientId, user.id)
  }
}
