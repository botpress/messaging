import { BaseClient } from './base'
import { Message } from './messages'

export class ConversationClient extends BaseClient {
  async create(userId: string): Promise<Conversation> {
    return this.deserialize((await this.http.post('/conversations', { userId })).data)
  }

  async get(id: string): Promise<Conversation> {
    return this.deserialize((await this.http.get(`/conversations/${id}`)).data)
  }

  async list(userId: string, limit: number): Promise<ConversationWithLastMessage[]> {
    return (await this.http.get('/conversations', { params: { userId, limit } })).data.map((x: any) =>
      this.deserialize(x)
    )
  }

  async getRecent(userId: string): Promise<Conversation> {
    return this.deserialize((await this.http.get(`/conversations/${userId}/recent`)).data)
  }

  public deserialize(conversation: any) {
    return {
      ...conversation,
      createdOn: new Date(conversation.createdOn)
    }
  }
}

export interface Conversation {
  id: string
  clientId: string
  userId: string
  createdOn: Date
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessage?: Message
}
