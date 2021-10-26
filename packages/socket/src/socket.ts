import { Conversation, Message, User, uuid } from '@botpress/messaging-base'
import { SocketComEvents } from '.'
import { SocketCom } from './com'

export class MessagingSocket {
  public readonly clientId: uuid
  private readonly com: SocketCom

  public userId: uuid | undefined
  public conversationId: uuid | undefined
  public token: string | undefined

  constructor(options: MessagingSocketOptions) {
    this.clientId = options.clientId
    this.com = new SocketCom(options.url)
  }

  on(eventId: any, callback: ((data: any) => Promise<void>) | ((data: any) => void)) {
    // Garbage refact this

    if (eventId === 'connect') {
      this.com.events.on(SocketComEvents.Connect, <any>callback)
    } else {
      this.com.events.on(SocketComEvents.Message, async (data) => {
        if (data.type === eventId) {
          await callback(data.data.data)
        }
      })
    }
  }

  async connect(options?: { auto: boolean; info?: UserInfo }) {
    this.com.connect()

    if (options?.auto !== false) {
      await this.authUser(options?.info)
      await this.createConversation()
    }
  }

  async disconnect() {
    this.com.disconnect()
  }

  async authUser(info?: UserInfo): Promise<UserInfo> {
    const result = await this.request<UserInfo>('users.auth', {
      clientId: this.clientId,
      ...(info || {})
    })

    if (result.id === info?.id && !result.token) {
      result.token = info.token
    }

    this.userId = result.id

    return result
  }

  getUser(): Promise<User | undefined> {
    return this.request('users.get', {})
  }

  switchConversation(id: uuid | undefined) {
    this.conversationId = id
  }

  async createConversation(options?: { switch: boolean }): Promise<Conversation> {
    const conversation = await this.request<Conversation>('conversations.create', {})

    if (options?.switch !== false) {
      this.switchConversation(conversation.id)
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
      this.switchConversation(undefined)
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

export interface MessagingSocketOptions {
  url: string
  clientId: uuid
}

export interface UserInfo {
  id: uuid
  token: string
}
