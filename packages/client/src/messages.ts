import { Message } from '@botpress/messaging-base'
import { BaseClient } from './base'
import { handleNotFound } from './errors'

export class MessageClient extends BaseClient {
  async create(conversationId: string, authorId: string | undefined, payload: any): Promise<Message> {
    return this.deserialize((await this.http.post<Message>('/messages', { conversationId, authorId, payload })).data)
  }

  async get(id: string): Promise<Message | undefined> {
    return handleNotFound(async () => {
      this.deserialize((await this.http.get<Message>(`/messages/${id}`)).data)
    }, undefined)
  }

  async list(conversationId: string, limit: number): Promise<Message[]> {
    return handleNotFound(async () => {
      return (await this.http.get<Message[]>('/messages', { params: { conversationId, limit } })).data.map((x) =>
        this.deserialize(x)
      )
    }, [])
  }

  async delete(filters: { id?: string; conversationId?: string }): Promise<number> {
    return (await this.http.delete<{ count: number }>('/messages', { params: filters })).data.count
  }

  public deserialize(message: Message): Message {
    return {
      ...message,
      sentOn: new Date(message.sentOn)
    }
  }
}
