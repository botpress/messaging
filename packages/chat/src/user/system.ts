import { User, uuid } from '@botpress/messaging-client'
import { WebchatSocket } from '../socket/system'
import { WebchatStorage } from '../storage/system'
import { UserEmitter, UserEvents, UserWatcher } from './events'

export class WebchatUser {
  public readonly events: UserWatcher
  public current?: User

  private emitter: UserEmitter

  constructor(private clientId: uuid, private storage: WebchatStorage, private socket: WebchatSocket) {
    this.emitter = new UserEmitter()
    this.events = this.emitter
  }

  async setup() {
    let user = this.storage.get<User>('saved-user')

    user = await this.socket.request<User>('users.auth', {
      clientId: this.clientId,
      userId: user?.id,
      userToken: 'abc123'
    })

    this.storage.set('saved-user', user)
    await this.set(user)
  }

  async set(value: User) {
    const previous = this.current
    this.current = value
    await this.emitter.emit(UserEvents.Set, { previous, value })
  }
}
