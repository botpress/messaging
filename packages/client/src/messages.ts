import { Message } from '@botpress/messaging-base'
import { BaseClient } from './base'

export class MessageClient extends BaseClient {
  async create(
    conversationId: string,
    authorId: string | undefined,
    payload: any,
    flags?: { incomingId: string }
  ): Promise<Message> {
    return this.deserialize(
      (await this.http.post<Message>('/messages', { conversationId, authorId, payload, incomingId: flags?.incomingId }))
        .data
    )
  }

  async get(id: string): Promise<Message | undefined> {
    const message = (await this.http.get<Message>(`/messages/${id}`)).data
    if (message) {
      return this.deserialize(message)
    } else {
      return undefined
    }
  }

  async list(conversationId: string, limit?: number): Promise<Message[]> {
    return (await this.http.get<Message[]>(`/messages/conversation/${conversationId}`, { params: { limit } })).data.map(
      (x) => this.deserialize(x)
    )
  }

  // TODO: this is incorrect
  async delete(filters: { id?: string; conversationId?: string }): Promise<number> {
    return (await this.http.delete<{ count: number }>('/messages', { params: filters })).data.count
  }

  async endTurn(id: string) {
    await this.http.post(`/messages/turn/${id}`)
  }

  public deserialize(message: Message): Message {
    return {
      ...message,
      sentOn: new Date(message.sentOn)
    }
  }
}
