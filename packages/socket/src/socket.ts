import { Conversation, Message, User, uuid } from '@botpress/messaging-base'
import { SocketCom, SocketComEvents } from './com'
import { SocketEmitter } from './emitter'

export class MessagingSocket extends SocketEmitter<{
  connect: UserCredentials
  disconnect: undefined
  user: uuid | undefined
  conversation: uuid | undefined
  message: Message
}> {
  public readonly clientId: uuid

  public get creds() {
    return this._creds
  }

  public get userId() {
    return this._creds?.userId
  }

  public get conversationId() {
    return this._conversationId
  }

  private readonly com: SocketCom
  private _creds: UserCredentials | undefined
  private _conversationId: uuid | undefined

  constructor(options: MessagingSocketOptions) {
    super()
    this.clientId = options.clientId
    this.com = new SocketCom(options.url)

    this.com.events.on(SocketComEvents.Message, async (e) => {
      if (e.type === 'message.new') {
        await this.emit('message', e.data.message)
      }
    })
  }

  async connect(creds?: UserCredentials): Promise<UserCredentials> {
    const result = await this.com.connect({ clientId: this.clientId, creds })

    if (result.userId === creds?.userId && !result.userToken) {
      result.userToken = creds!.userToken
    }

    this._creds = result

    await this.emit('connect', this._creds)
    await this.emit('user', this._creds.userId)

    return result
  }

  async disconnect() {
    this.com.disconnect()
    await this.emit('disconnect', undefined)
  }

  async getUser(): Promise<User | undefined> {
    return this.request('users.get', {})
  }

  async switchConversation(id?: uuid) {
    this._conversationId = id

    await this.emit('conversation', this._conversationId)
  }

  async createConversation(options?: { switch: boolean }): Promise<Conversation> {
    const conversation = await this.request<Conversation>('conversations.create', {})

    if (options?.switch !== false) {
      await this.switchConversation(conversation.id)
    }

    return conversation
  }

  async startConversation(id?: uuid) {
    await this.request<Conversation>('conversations.start', { id: id || this._conversationId })
  }

  async getConversation(id?: uuid): Promise<Conversation | undefined> {
    return this.request('conversations.get', {
      id: id || this._conversationId
    })
  }

  async deleteConversation(id?: uuid): Promise<boolean> {
    const deleted = await this.request<boolean>('conversations.delete', {
      id: id || this._conversationId
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
      conversationId: this._conversationId,
      payload: { type: 'text', text }
    })
  }

  async sendPayload(payload: any): Promise<Message> {
    return this.request('messages.create', {
      conversationId: this._conversationId,
      payload
    })
  }

  async listMessages(limit?: number): Promise<Message[]> {
    return this.request('messages.list', {
      conversationId: this._conversationId,
      limit: limit || 20
    })
  }

  async sendFeedback(messageId: uuid, feedback: number) {
    await this.request('messages.feedback', {
      messageId,
      feedback
    })
  }

  protected request<T>(type: string, data: any) {
    return this.com.request<T>(type, data)
  }
}

export interface MessagingSocketOptions {
  url: string
  clientId: uuid
}

export interface UserCredentials {
  userId: uuid
  userToken: string
}
