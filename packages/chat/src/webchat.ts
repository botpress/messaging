import { MessagingClient } from '@botpress/messaging-client'
import { WebchatConversation } from './conversation/system'
import { WebchateLocale } from './locale/system'
import { WebchatMessages } from './messages/system'
import { WebchatSocket } from './socket/system'
import { WebchatStorage } from './storage/system'
import { WebchatUser } from './user/system'

export class BotpressWebchat {
  public readonly locale: WebchateLocale
  public readonly socket: WebchatSocket
  public readonly client: MessagingClient
  public readonly storage: WebchatStorage
  public readonly user: WebchatUser
  public readonly conversation: WebchatConversation
  public readonly messages: WebchatMessages

  constructor(private url: string, public readonly clientId: string) {
    this.client = new MessagingClient({ url: this.url })
    this.locale = new WebchateLocale()
    this.socket = new WebchatSocket(url)
    this.storage = new WebchatStorage()
    this.user = new WebchatUser(this.clientId, this.storage, this.socket)
    this.conversation = new WebchatConversation(this.clientId, this.storage, this.socket, this.user)
    this.messages = new WebchatMessages(this.clientId, this.socket, this.user, this.conversation)
  }

  public async setup() {
    await this.locale.setup()
    await this.socket.setup()
    await this.user.setup()
    await this.conversation.setup()
    await this.messages.setup()
  }
}
