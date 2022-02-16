import { SocketManager, SocketRequest } from '../socket/manager'
import { UserService } from '../users/service'
import { Schema } from './schema'
import { ConversationService } from './service'

export class ConversationSocket {
  constructor(private sockets: SocketManager, private users: UserService, private conversations: ConversationService) {}

  setup() {
    this.sockets.handle('conversations.create', Schema.Socket.Create, this.create.bind(this))
    this.sockets.handle('conversations.start', Schema.Socket.Start, this.start.bind(this))
    this.sockets.handle('conversations.get', Schema.Socket.Get, this.get.bind(this))
    this.sockets.handle('conversations.list', Schema.Socket.List, this.list.bind(this))
    this.sockets.handle('conversations.delete', Schema.Socket.Delete, this.delete.bind(this))
  }

  async create(socket: SocketRequest) {
    const user = await this.users.get(socket.userId)
    const conversation = await this.conversations.create(user.clientId, user.id)

    socket.reply(conversation)
  }

  async start(socket: SocketRequest) {
    const { id } = socket.data
    const conversation = await this.conversations.fetch(id)

    if (!conversation || conversation.userId !== socket.userId) {
      return socket.notFound('Conversation does not exist')
    }

    await this.conversations.start(id)

    socket.reply(true)
  }

  async get(socket: SocketRequest) {
    const { id } = socket.data
    const conversation = await this.conversations.fetch(id)

    if (!conversation || conversation.userId !== socket.userId) {
      return socket.notFound('Conversation does not exist')
    }

    socket.reply(conversation)
  }

  async list(socket: SocketRequest) {
    const { limit } = socket.data

    const user = await this.users.get(socket.userId)
    const conversations = await this.conversations.listByUserId(user.clientId, socket.userId, +limit)

    socket.reply(conversations)
  }

  async delete(socket: SocketRequest) {
    const { id } = socket.data
    const conversation = await this.conversations.fetch(id)

    if (!conversation || conversation.userId !== socket.userId) {
      return socket.forbid('Conversation does not exist')
    }

    await this.conversations.delete(id)
    socket.reply(true)
  }
}
