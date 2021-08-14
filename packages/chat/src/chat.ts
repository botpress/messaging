import { MessagingSocket } from '@botpress/messaging-socket'
import { WebchatConversation } from './conversation/system'
import { WebchatLang } from './lang/system'
import { WebchateLocale } from './locale/system'
import { WebchatMessages } from './messages/system'
import { WebchatStorage } from './storage/system'
import { WebchatUser } from './user/system'

export class Webchat {
  public readonly socket: MessagingSocket
  public readonly storage: WebchatStorage
  public readonly locale: WebchateLocale
  public readonly lang: WebchatLang
  public readonly user: WebchatUser
  public readonly conversation: WebchatConversation
  public readonly messages: WebchatMessages

  constructor(private url: string, public readonly clientId: string) {
    this.socket = new MessagingSocket(this.url)
    this.storage = new WebchatStorage()
    this.locale = new WebchateLocale()
    this.lang = new WebchatLang(this.locale)
    this.user = new WebchatUser(this.clientId, this.storage, this.socket)
    this.conversation = new WebchatConversation(this.clientId, this.storage, this.socket, this.user)
    this.messages = new WebchatMessages(this.clientId, this.socket, this.user, this.conversation)
  }

  public async setup() {
    await this.storage.setup()
    await this.locale.setup()
    await this.lang.setup()
    await this.user.setup()
    await this.conversation.setup()
    await this.messages.setup()
  }
}
