import { App } from './app'
import { ConversationSocket } from './conversations/socket'
import { MessageSocket } from './messages/socket'
import { SocketManager } from './socket/manager'
import { UserSocket } from './users/socket'

export class Socket {
  public readonly manager: SocketManager

  private users: UserSocket
  private conversations: ConversationSocket
  private messages: MessageSocket

  constructor({ clients, users, userTokens, conversations, messages, sockets }: App) {
    this.manager = new SocketManager(sockets)
    this.users = new UserSocket(this.manager, clients, users, userTokens, sockets)
    this.conversations = new ConversationSocket(this.manager, users, conversations)
    this.messages = new MessageSocket(this.manager, conversations, messages)
  }

  async setup() {
    this.users.setup()
    this.conversations.setup()
    this.messages.setup()
  }
}
