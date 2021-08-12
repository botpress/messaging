import { BaseClient } from './base'

export class MessageClient extends BaseClient {
  async create(conversationId: string, authorId: string | undefined, payload: any): Promise<Message> {
    return this.deserialize((await this.http.post('/messages', { conversationId, authorId, payload })).data)
  }

  async get(id: string): Promise<Message> {
    return this.deserialize((await this.http.get(`/messages/${id}`)).data)
  }

  async list(conversationId: string, limit: number): Promise<Message[]> {
    return (await this.http.get('/messages', { params: { conversationId, limit } })).data.map((x: any) =>
      this.deserialize(x)
    )
  }

  async delete(filters: { id?: string; conversationId?: string }): Promise<number> {
    return (await this.http.delete('/messages', { params: filters })).data
  }

  public deserialize(message: any) {
    return {
      ...message,
      sentOn: new Date(message.sentOn)
    }
  }
}

export interface Message {
  id: string
  conversationId: string
  authorId: string | undefined
  sentOn: Date
  payload: any
}
