import { Streamer } from '../base/streamer'
import { UserCreatedEvent, UserEvents, UserFetchedEvent } from './events'
import { UserService } from './service'

export class UserStream {
  constructor(private streamer: Streamer, private users: UserService) {}

  async setup() {
    this.users.events.on(UserEvents.Created, this.handleUserCreated.bind(this))
    this.users.events.on(UserEvents.Fetched, this.handleUserFetched.bind(this))
  }

  private async handleUserCreated({ user }: UserCreatedEvent) {
    await this.streamer.stream('user.new', {}, user.clientId, user.id)
  }

  private async handleUserFetched({ user }: UserFetchedEvent) {
    await this.streamer.stream('user.fetched', {}, user.clientId, user.id)
  }
}
