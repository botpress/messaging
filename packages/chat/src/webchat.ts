import { Conversation, Message, MessagingClient, User } from '@botpress/messaging-client'
import { WebchatEmitter, WebchatEvents, WebchatWatcher } from './events'

export class BotpressWebchat {
  public events: WebchatWatcher
  private emitter: WebchatEmitter

  private client!: MessagingClient
  private user!: User
  private convo!: Conversation
  private messages!: Message[]

  constructor(private url: string) {
    this.emitter = new WebchatEmitter()
    this.events = this.emitter
    this.client = new MessagingClient({ url: this.url })
  }

  public getAuth() {
    return this.client.auth
  }

  public async setup() {
    await this.emitter.emit(WebchatEvents.Setup, null)

    await this.authenticate()
    await this.testCreateMessages()
  }

  private async authenticate() {
    const { id, token } = await this.client.syncs.sync({ channels: {} })
    this.client.authenticate(id, token)

    await this.emitter.emit(WebchatEvents.Authenticated, null)
  }

  private async testCreateMessages() {
    this.user = await this.client.users.create()
    this.convo = await this.client.conversations.create(this.user.id)

    for (let i = 0; i < 10; i++) {
      this.client.messages.create(this.convo.id, this.user.id, { type: 'text', text: `yoyoy!${i}` })
    }

    this.messages = await this.client.messages.list(this.convo.id, 100)

    await this.emitter.emit(WebchatEvents.Messages, this.messages)
  }
}
