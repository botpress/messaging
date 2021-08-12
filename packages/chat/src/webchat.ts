import { Message, MessagingClient } from '@botpress/messaging-client'
import { WebchatConversation } from './conversation/system'
import { WebchatEmitter, WebchatEvents, WebchatWatcher } from './events'
import { WebchateLocale } from './locale/system'
import { WebchatStorage } from './storage/system'
import { WebchatUser } from './user/system'

export class BotpressWebchat {
  public readonly events: WebchatWatcher
  public readonly locale: WebchateLocale
  public readonly client: MessagingClient
  public readonly storage: WebchatStorage
  public readonly user: WebchatUser
  public readonly conversation: WebchatConversation

  public get auth() {
    return this.client.auth
  }

  private emitter: WebchatEmitter
  private messages!: Message[]

  constructor(private url: string) {
    this.client = new MessagingClient({ url: this.url })
    this.locale = new WebchateLocale()
    this.storage = new WebchatStorage()
    this.user = new WebchatUser()
    this.conversation = new WebchatConversation()

    this.emitter = new WebchatEmitter()
    this.events = this.emitter
  }

  public async setup() {
    await this.emitter.emit(WebchatEvents.Setup, null)

    this.locale.setup()

    await this.authenticate()
    await this.testCreateMessages()
  }

  private async authenticate() {
    let auth = this.storage.get<{ id: string; token: string }>('saved-auth')

    if (!auth) {
      auth = await this.client.syncs.sync({ channels: {} })
      this.storage.set('saved-auth', { id: auth.id, token: auth.token })
    }

    this.client.authenticate(auth.id, auth.token)
    await this.emitter.emit(WebchatEvents.Auth, null)
  }

  private async testCreateMessages() {
    this.user.current = await this.client.users.create()
    this.conversation.current = await this.client.conversations.create(this.user.current.id)

    for (let i = 0; i < 10; i++) {
      const message = await this.client.messages.create(this.conversation.current.id, this.user.current.id, {
        type: 'text',
        text: `yoyoy!${i}`
      })

      await this.emitter.emit(WebchatEvents.Messages, [message])
    }

    this.messages = await this.client.messages.list(this.conversation.current.id, 100)

    await this.emitter.emit(WebchatEvents.Messages, this.messages.reverse())
  }
}
