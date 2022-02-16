import { ConversationService } from '../conversations/service'
import { SocketManager, SocketRequest } from '../socket/manager'
import { Schema } from './schema'
import { MessageService } from './service'

export class MessageSocket {
  constructor(
    private sockets: SocketManager,
    private conversations: ConversationService,
    private messages: MessageService
  ) {}

  setup() {
    this.sockets.handle('messages.create', Schema.Socket.Create, this.create.bind(this))
    this.sockets.handle('messages.list', Schema.Socket.List, this.list.bind(this))
    this.sockets.handle('messages.feedback', Schema.Socket.Feedback, this.feedback.bind(this))
  }

  async create(socket: SocketRequest) {
    const { conversationId, payload } = socket.data
    const conversation = await this.conversations.fetch(conversationId)

    if (!conversation || conversation.userId !== socket.userId) {
      return socket.notFound('Conversation does not exist')
    }

    const message = await this.messages.create(conversationId, socket.userId, payload, {
      socket: { id: socket.socket.id }
    })
    socket.reply(message)
  }

  async list(socket: SocketRequest) {
    const { conversationId, limit } = socket.data
    const conversation = await this.conversations.fetch(conversationId)

    if (!conversation || conversation.userId !== socket.userId) {
      return socket.notFound('Conversation does not exist')
    }

    const messages = await this.messages.listByConversationId(conversationId, limit)
    socket.reply(messages)
  }

  async feedback(socket: SocketRequest) {
    const { messageId, feedback } = socket.data

    const message = await this.messages.fetch(messageId)
    if (!message) {
      return socket.notFound('Message does not exist')
    }

    const conversation = await this.conversations.fetch(message.conversationId)
    if (!conversation || conversation.userId !== socket.userId) {
      return socket.notFound('Conversation does not exist')
    }

    await this.messages.feedback(messageId, feedback)
    socket.reply(true)
  }
}
