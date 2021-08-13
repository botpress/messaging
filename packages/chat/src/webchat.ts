import { Conversation, MessagingClient, User } from '@botpress/messaging-client'
import { WebchatConversation } from './conversation/system'
import { WebchatEmitter, WebchatEvents, WebchatWatcher } from './events'
import { WebchateLocale } from './locale/system'
import { WebchatSocket } from './socket/system'
import { WebchatStorage } from './storage/system'
import { WebchatUser } from './user/system'

export class BotpressWebchat {
  public readonly events: WebchatWatcher
  public readonly locale: WebchateLocale
  public readonly socket: WebchatSocket
  public readonly client: MessagingClient
  public readonly storage: WebchatStorage
  public readonly user: WebchatUser
  public readonly conversation: WebchatConversation
  private emitter: WebchatEmitter

  constructor(private url: string, public readonly clientId: string) {
    this.client = new MessagingClient({ url: this.url })
    this.locale = new WebchateLocale()
    this.socket = new WebchatSocket(url)
    this.storage = new WebchatStorage()
    this.user = new WebchatUser()
    this.conversation = new WebchatConversation()

    this.emitter = new WebchatEmitter()
    this.events = this.emitter
  }

  public async setup() {
    await this.emitter.emit(WebchatEvents.Setup, null)

    this.locale.setup()
    await this.socket.setup()

    await this.testCreateMessages()
  }

  public async postMessage(text: string) {
    const content = {
      type: 'text',
      text
    }

    const message = await this.client.messages.create(this.conversation.current!.id, this.user.current!.id, content)

    await this.socket.send(content)

    await this.emitter.emit(WebchatEvents.Messages, [message])
  }

  private async testCreateMessages() {
    let user = this.storage.get<User>('saved-user')

    user = await this.socket.request<User>('auth', {
      userId: user?.id,
      userToken: 'abc123',
      clientId: this.clientId
    })

    this.storage.set('saved-user', user)
    this.user.current = user

    let conversation = this.storage.get<Conversation>('saved-conversation')
    if (!conversation) {
      conversation = await this.client.conversations.create(this.user.current!.id)
      this.storage.set('saved-conversation', conversation)
    } else {
      conversation = this.client.conversations.deserialize(conversation)
    }
    await this.conversation.set(conversation!)

    const messages = await this.client.messages.list(this.conversation.current!.id, 100)
    await this.emitter.emit(WebchatEvents.Messages, messages.reverse())
  }
}
