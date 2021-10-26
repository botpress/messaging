import { Conversation, Message, User, uuid } from '@botpress/messaging-base'
import { SocketComEvents } from '.'
import { SocketCom } from './com'
import { SocketEmitter } from './emitter'

export class MessagingSocket extends SocketEmitter<{
  connect: undefined
  disconnect: undefined
  user: UserInfo | undefined
  conversation: uuid | undefined
  message: Message
}> {
  public readonly clientId: uuid
  private readonly com: SocketCom

  private user: UserInfo | undefined
  private conversationId: uuid | undefined

  constructor(options: MessagingSocketOptions) {
    super()
    this.clientId = options.clientId
    this.com = new SocketCom(options.url)

    this.com.events.on(SocketComEvents.Message, async (e) => {
      if (e.type === 'message.new') {
        await this.emit('message', e.data.data.message)
      }
    })
  }

  async connect(options?: { auto: boolean; info?: UserInfo }) {
    this.com.connect()
    await this.emit('connect', undefined)

    if (options?.auto !== false) {
      await this.authUser(options?.info)
      await this.createConversation()
    }
  }

  async disconnect() {
    this.com.disconnect()
    await this.emit('disconnect', undefined)
  }

  async authUser(info?: UserInfo): Promise<UserInfo> {
    const result = await this.request<UserInfo>('users.auth', {
      clientId: this.clientId,
      ...(info || {})
    })

    if (result.userId === info?.userId && !result.userToken) {
      result.userToken = info.userToken
    }

    this.user = result
    await this.emit('user', { ...this.user })

    return result
  }

  getUser(): Promise<User | undefined> {
    return this.request('users.get', {})
  }

  async switchConversation(id: uuid | undefined) {
    this.conversationId = id

    await this.emit('conversation', this.conversationId)
  }

  async createConversation(options?: { switch: boolean }): Promise<Conversation> {
    const conversation = await this.request<Conversation>('conversations.create', {})

    if (options?.switch !== false) {
      await this.switchConversation(conversation.id)
    }

    return conversation
  }

  async getConversation(id?: uuid): Promise<Conversation | undefined> {
    return this.request('conversations.get', {
      id: id || this.conversationId
    })
  }

  async deleteConversation(id?: uuid): Promise<boolean> {
    const deleted = await this.request<boolean>('conversations.delete', {
      id: id || this.conversationId
    })

    if (deleted) {
      await this.switchConversation(undefined)
    }

    return deleted
  }

  async listConversations(limit?: number): Promise<Conversation[]> {
    return this.request('conversations.list', {
      limit: limit || 20
    })
  }

  async sendText(text: string): Promise<Message> {
    return this.request('messages.create', {
      conversationId: this.conversationId,
      payload: { type: 'text', text }
    })
  }

  async sendPayload(payload: any): Promise<Message> {
    return this.request('messages.create', {
      conversationId: this.conversationId,
      payload
    })
  }

  async listMessages(limit?: number): Promise<Message[]> {
    return this.request('messages.list', {
      conversationId: this.conversationId,
      limit: limit || 20
    })
  }

  protected request<T>(type: string, data: any) {
    return this.com.request<T>(type, data)
  }
}

export enum MessagingEvents {
  Connect = 'connect',
  Disconnect = 'disconnect',
  User = 'user',
  Conversation = 'conversation',
  Message = 'message'
}

export interface MessagingSocketOptions {
  url: string
  clientId: uuid
}

export interface UserInfo {
  userId: uuid
  userToken: string
}
