import { BaseClient } from './base'
import { Message } from './messages'

export class ConversationClient extends BaseClient {
  async create(userId: string): Promise<Conversation> {
    return (await this.http.post('/conversations', { userId })).data
  }

  async get(id: string): Promise<Conversation> {
    return (await this.http.get(`/conversations/${id}`)).data
  }

  async list(userId: string, limit: number): Promise<ConversationWithLastMessage[]> {
    return (await this.http.get('/conversations', { params: { userId, limit } })).data
  }

  async getRecent(userId: string): Promise<Conversation> {
    return (await this.http.get(`/conversations/${userId}/recent`)).data
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
