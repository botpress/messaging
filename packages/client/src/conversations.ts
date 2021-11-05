import { Conversation, ConversationWithLastMessage } from '@botpress/messaging-base'
import { BaseClient } from './base'
import { handleNotFound } from './errors'

export class ConversationClient extends BaseClient {
  async create(userId: string): Promise<Conversation> {
    return this.deserialize((await this.http.post<Conversation>('/conversations', { userId })).data)
  }

  async get(id: string): Promise<Conversation | undefined> {
    return handleNotFound(async () => {
      return this.deserialize((await this.http.get<Conversation>(`/conversations/${id}`)).data)
    }, undefined)
  }

  async list(userId: string, limit?: number): Promise<ConversationWithLastMessage[]> {
    return handleNotFound(async () => {
      return (await this.http.get<Conversation[]>(`/conversations/user/${userId}`, { params: { limit } })).data.map(
        (x) => this.deserialize(x)
      )
    }, [])
  }

  async getRecent(userId: string): Promise<Conversation> {
    return this.deserialize((await this.http.get<Conversation>(`/conversations/user/${userId}/recent`)).data)
  }

  public deserialize(conversation: Conversation): Conversation {
    return {
      ...conversation,
      createdOn: new Date(conversation.createdOn)
    }
  }
}
