import { Message, uuid } from '@botpress/messaging-base'
import { BaseClient } from './base'

export class MessageClient extends BaseClient {
  async create(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    flags?: { incomingId: uuid }
  ): Promise<Message> {
    return this.deserialize(
      (await this.http.post<Message>('/messages', { conversationId, authorId, payload, incomingId: flags?.incomingId }))
        .data
    )
  }

  async get(id: uuid): Promise<Message | undefined> {
    return handleNotFound(async () => {
      return this.deserialize((await this.http.get<Message>(`/messages/${id}`)).data)
    }, undefined)
  }

  async list(conversationId: uuid, limit?: number): Promise<Message[]> {
    return (await this.http.get<Message[]>(`/messages/conversation/${conversationId}`, { params: { limit } })).data.map(
      (x) => this.deserialize(x)
    )
  }

  async delete(id: uuid): Promise<boolean> {
    return handleNotFound(async () => {
      await this.http.delete<boolean>(`/messages/${id}`)
      return true
    }, false)
  }

  async deleteByConversation(conversationId: uuid): Promise<number> {
    return handleNotFound(async () => {
      return (await this.http.delete<{ count: number }>(`/messages/conversation/${conversationId}`)).data.count
    }, 0)
  }

  async endTurn(id: uuid) {
    await this.http.post(`/messages/turn/${id}`)
  }

  public deserialize(message: Message): Message {
    return {
      ...message,
      sentOn: new Date(message.sentOn)
    }
  }
}
