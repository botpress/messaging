import { User, uuid } from '@botpress/messaging-base'
import { MessagingSocket } from '@botpress/messaging-socket'
import { WebchatStorage } from '../storage/system'
import { UserEmitter, UserEvents, UserWatcher } from './events'

export class WebchatUser {
  public readonly events: UserWatcher
  private readonly emitter: UserEmitter
  private current?: User

  constructor(private clientId: uuid, private storage: WebchatStorage, private socket: MessagingSocket) {
    this.emitter = new UserEmitter()
    this.events = this.emitter
  }

  async setup() {
    const saved = this.storage.get<User>('saved-user')
    const user = await this.socket.com.request<User>('users.auth', {
      clientId: this.clientId,
      userId: saved?.id,
      userToken: 'abc123'
    })
    this.storage.set('saved-user', user)

    await this.set(user)
  }

  get() {
    return this.current
  }

  async set(value: User) {
    const previous = this.current
    this.current = value
    await this.emitter.emit(UserEvents.Set, { previous, value })
  }
}
