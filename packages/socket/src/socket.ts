import { uuid } from '@botpress/messaging-base'
import { SocketCom } from './com'
import { ConversationSocket } from './conversations'
import { MessageSocket } from './messages'
import { UserSocket } from './users'

export class MessagingSocket {
  public readonly com: SocketCom
  public readonly users: UserSocket
  public readonly conversations: ConversationSocket
  public readonly messages: MessageSocket

  public readonly auth: MessagingSocketAuth

  constructor(options: MessagingSocketOptions) {
    this.auth = { ...options.auth }
    this.com = new SocketCom(options.url, options.manualConnect)
    this.users = new UserSocket(this.com, this.auth)
    this.conversations = new ConversationSocket(this.com, this.auth)
    this.messages = new MessageSocket(this.com, this.auth)
  }
}

export interface MessagingSocketOptions {
  url: string
  auth: MessagingSocketAuth
  manualConnect: boolean
}

export interface MessagingSocketAuth {
  clientId: uuid
  userId?: uuid
}
