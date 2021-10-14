import { Conversation, ConversationWithLastMessage } from '@botpress/messaging-base'
import axios from 'axios'
import { BaseClient } from './base'

export class ConversationClient extends BaseClient {
  async create(userId: string): Promise<Conversation> {
    return this.deserialize((await this.http.post<Conversation>('/conversations', { userId })).data)
  }

  async get(id: string): Promise<Conversation | undefined> {
    try {
      return this.deserialize((await this.http.get<Conversation>(`/conversations/${id}`)).data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return undefined
      }

      throw err
    }
  }

  async list(userId: string, limit: number): Promise<ConversationWithLastMessage[]> {
    return (await this.http.get<Conversation[]>('/conversations', { params: { userId, limit } })).data.map((x) =>
      this.deserialize(x)
    )
  }

  async getRecent(userId: string): Promise<Conversation> {
    return this.deserialize((await this.http.get<Conversation>(`/conversations/${userId}/recent`)).data)
  }

  public deserialize(conversation: Conversation): Conversation {
    return {
      ...conversation,
      createdOn: new Date(conversation.createdOn)
    }
  }
}
