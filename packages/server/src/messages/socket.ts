import { ConversationService } from '../conversations/service'
import { SocketManager, SocketRequest } from '../socket/manager'
import { CreateMsgSocketSchema, ListMsgSocketSchema } from './schema'
import { MessageService } from './service'

export class MessageSocket {
  constructor(
    private sockets: SocketManager,
    private conversations: ConversationService,
    private messages: MessageService
  ) {}

  setup() {
    this.sockets.handle('messages.create', CreateMsgSocketSchema, this.create.bind(this))
    this.sockets.handle('messages.list', ListMsgSocketSchema, this.list.bind(this))
  }

  async create(socket: SocketRequest) {
    const { conversationId, payload } = socket.data
    const conversation = await this.conversations.get(conversationId)

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
    const conversation = await this.conversations.get(conversationId)

    if (!conversation || conversation.userId !== socket.userId) {
      return socket.notFound('Conversation does not exist')
    }

    const messages = await this.messages.listByConversationId(conversationId, limit)
    socket.reply(messages)
  }
}
