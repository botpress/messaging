import { Conversation, HealthReport, Message, SyncRequest, SyncResult, User, uuid } from '@botpress/messaging-base'
import { BaseClient } from '.'
import { handleNotFound } from './errors'

export class MessagingClient extends BaseClient {
  async sync(config: SyncRequest): Promise<SyncResult> {
    return (await this.http.post('/sync', config)).data
  }

  async getHealth(): Promise<HealthReport> {
    return this.deserializeHealth((await this.http.get<HealthReport>('/health')).data)
  }

  async createUser(): Promise<User> {
    return (await this.http.post<User>('/users')).data
  }

  async getUser(id: uuid): Promise<User | undefined> {
    return handleNotFound(async () => {
      return (await this.http.get<User>(`/users/${id}`)).data
    }, undefined)
  }

  async createConversation(userId: uuid): Promise<Conversation> {
    return this.deserializeConversation((await this.http.post<Conversation>('/conversations', { userId })).data)
  }

  async getConversation(id: uuid): Promise<Conversation | undefined> {
    return handleNotFound(async () => {
      return this.deserializeConversation((await this.http.get<Conversation>(`/conversations/${id}`)).data)
    }, undefined)
  }

  async listConversations(userId: uuid, limit?: number): Promise<Conversation[]> {
    return (await this.http.get<Conversation[]>(`/conversations/user/${userId}`, { params: { limit } })).data.map((x) =>
      this.deserializeConversation(x)
    )
  }

  async createMessage(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    flags?: { incomingId: uuid }
  ): Promise<Message> {
    return this.deserializeMessage(
      (await this.http.post<Message>('/messages', { conversationId, authorId, payload, incomingId: flags?.incomingId }))
        .data
    )
  }

  async getMessage(id: uuid): Promise<Message | undefined> {
    return handleNotFound(async () => {
      return this.deserializeMessage((await this.http.get<Message>(`/messages/${id}`)).data)
    }, undefined)
  }

  async listMessages(conversationId: uuid, limit?: number) {
    return (await this.http.get<Message[]>(`/messages/conversation/${conversationId}`, { params: { limit } })).data.map(
      (x) => this.deserializeMessage(x)
    )
  }

  async deleteMessage(id: uuid): Promise<boolean> {
    return handleNotFound(async () => {
      await this.http.delete<boolean>(`/messages/${id}`)
      return true
    }, false)
  }

  async deleteMessagesByConversation(conversationId: uuid): Promise<number> {
    return handleNotFound(async () => {
      return (await this.http.delete<{ count: number }>(`/messages/conversation/${conversationId}`)).data.count
    }, 0)
  }

  async endTurn(id: uuid) {
    await this.http.post(`/messages/turn/${id}`)
  }

  private deserializeHealth(report: HealthReport) {
    for (const channel of Object.keys(report.channels)) {
      report.channels[channel].events = report.channels[channel].events.map((x) => ({ ...x, time: new Date(x.time) }))
    }

    return report
  }

  private deserializeConversation(conversation: Conversation): Conversation {
    return {
      ...conversation,
      createdOn: new Date(conversation.createdOn)
    }
  }

  private deserializeMessage(message: Message): Message {
    return {
      ...message,
      sentOn: new Date(message.sentOn)
    }
  }
}
