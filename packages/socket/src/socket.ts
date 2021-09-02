import { uuid } from '@botpress/messaging-base'
import { SocketCom } from './com'
import { ConversationSocket } from './conversations'
import { MessageSocket } from './messages'
import { UserSocket } from './users'

export class MessagingSocket {
  public readonly clientId: uuid
  public readonly com: SocketCom
  public readonly users: UserSocket
  public readonly conversations: ConversationSocket
  public readonly messages: MessageSocket

  constructor(options: MessagingSocketOptions) {
    this.clientId = options.clientId
    this.com = new SocketCom(options.url, options.manualConnect)
    this.users = new UserSocket(this.com, this.clientId)
    this.conversations = new ConversationSocket(this.com)
    this.messages = new MessageSocket(this.com)
  }
}

export interface MessagingSocketOptions {
  url: string
  clientId: uuid
  manualConnect: boolean
}
