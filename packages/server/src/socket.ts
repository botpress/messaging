import { Server } from 'http'
import { App } from './app'
import { ConversationSocket } from './conversations/socket'
import { MessageSocket } from './messages/socket'
import { SocketManager } from './socket/manager'
import { UserSocket } from './users/socket'

export class Socket {
  private manager: SocketManager

  private users: UserSocket
  private conversations: ConversationSocket
  private messages: MessageSocket

  constructor({ clients, users, userTokens, conversations, messages, sockets }: App) {
    this.manager = new SocketManager(clients, users, userTokens, sockets)
    this.users = new UserSocket(this.manager, users)
    this.conversations = new ConversationSocket(this.manager, users, conversations)
    this.messages = new MessageSocket(this.manager, conversations, messages)
  }

  async setup() {
    this.users.setup()
    this.conversations.setup()
    this.messages.setup()
  }

  async start(server: Server) {
    await this.manager.setup(server)
  }

  async destroy() {
    await this.manager.destroy()
  }
}
