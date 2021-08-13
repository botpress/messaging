import { Conversation, Message, MessagingClient, User } from '@botpress/messaging-client'
import { WebchatConversation } from './conversation/system'
import { WebchatEmitter, WebchatEvents, WebchatWatcher } from './events'
import { WebchateLocale } from './locale/system'
import { SocketEvents } from './socket/events'
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

    this.socket.events.on(SocketEvents.Message, async (message) => {
      if (message.type === 'message') {
        void this.emitter.emit(WebchatEvents.Messages, [message.data])
      }
    })

    await this.setupUser()
    await this.setupConversation()
    await this.setupMessages()
  }

  private async setupUser() {
    let user = this.storage.get<User>('saved-user')

    user = await this.socket.request<User>('auth', {
      userId: user?.id,
      userToken: 'abc123',
      clientId: this.clientId
    })

    this.storage.set('saved-user', user)
    this.user.current = user
  }

  private async setupConversation() {
    let conversation = this.storage.get<Conversation>('saved-conversation')

    conversation = await this.socket.request<Conversation>('use-convo', {
      userId: this.user.current?.id,
      conversationId: conversation?.id,
      clientId: this.clientId
    })

    this.storage.set('saved-conversation', conversation)
    await this.conversation.set(conversation!)
  }

  private async setupMessages() {
    const messages = await this.socket.request<Message[]>('list-messages', {
      clientId: this.clientId,
      userId: this.user.current?.id,
      conversationId: this.conversation.current?.id
    })
    await this.emitter.emit(WebchatEvents.Messages, messages.reverse())
  }

  public async postMessage(text: string) {
    const payload = {
      type: 'text',
      text
    }

    const message = await this.socket.request<Message>('create-message', {
      clientId: this.clientId,
      userId: this.user.current?.id,
      conversationId: this.conversation.current?.id,
      payload
    })

    await this.emitter.emit(WebchatEvents.Messages, [message])
  }
}
