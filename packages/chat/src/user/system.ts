import { User, uuid } from '@botpress/messaging-base'
import { MessagingSocket, UserInfo } from '@botpress/messaging-socket'
import { WebchatSystem } from '../base/system'
import { WebchatStorage } from '../storage/system'
import { UserEmitter, UserEvents, UserWatcher } from './events'

export class WebchatUser extends WebchatSystem {
  public readonly events: UserWatcher
  private readonly emitter: UserEmitter
  private current?: UserInfo

  constructor(private storage: WebchatStorage, private socket: MessagingSocket) {
    super()
    this.emitter = new UserEmitter()
    this.events = this.emitter
  }

  async setup() {
    const STORAGE_ID = 'saved-user'
    const saved = this.storage.get<UserInfo>(STORAGE_ID)

    const event = { choice: saved }
    await this.emitter.emit(UserEvents.Choose, event)

    const user = await this.socket.users.auth(event.choice)
    this.storage.set(STORAGE_ID, user)

    await this.set(user)
  }

  get() {
    return this.current
  }

  async set(value: UserInfo) {
    const previous = this.current
    this.current = value
    await this.emitter.emit(UserEvents.Set, { previous, value })
  }
}
