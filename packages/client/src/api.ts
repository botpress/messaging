import {
  Conversation,
  Endpoint,
  HealthReport,
  Message,
  SyncRequest,
  SyncResult,
  User,
  uuid
} from '@botpress/messaging-base'
import { MessagingChannelBase } from './base'
import { handleNotFound } from './errors'

export abstract class MessagingChannelApi extends MessagingChannelBase {
  async createClient(id?: uuid): Promise<{ id: uuid; token: string }> {
    return (await this.http.post('/admin/clients', { id }, { headers: this.adminHeader })).data
  }

  async syncClient(config: { name: string; id?: uuid; token?: string }): Promise<{ id: uuid; token: string }> {
    return (await this.http.post('/admin/clients/sync', config, { headers: this.adminHeader })).data
  }

  async sync(clientId: uuid, config: SyncRequest): Promise<SyncResult> {
    return (await this.http.post('/sync', config, { headers: this.headers[clientId] })).data
  }

  async getHealth(clientId: uuid): Promise<HealthReport> {
    return this.deserializeHealth(
      (await this.http.get<HealthReport>('/health', { headers: this.headers[clientId] })).data
    )
  }

  async createUser(clientId: uuid): Promise<User> {
    return (await this.http.post<User>('/users', undefined, { headers: this.headers[clientId] })).data
  }

  async getUser(clientId: uuid, id: uuid): Promise<User | undefined> {
    return handleNotFound(async () => {
      return (await this.http.get<User>(`/users/${id}`, { headers: this.headers[clientId] })).data
    }, undefined)
  }

  async createConversation(clientId: uuid, userId: uuid): Promise<Conversation> {
    return this.deserializeConversation(
      (await this.http.post<Conversation>('/conversations', { userId }, { headers: this.headers[clientId] })).data
    )
  }

  async getConversation(clientId: uuid, id: uuid): Promise<Conversation | undefined> {
    return handleNotFound(async () => {
      return this.deserializeConversation(
        (await this.http.get<Conversation>(`/conversations/${id}`, { headers: this.headers[clientId] })).data
      )
    }, undefined)
  }

  async listConversations(clientId: uuid, userId: uuid, limit?: number): Promise<Conversation[]> {
    return (
      await this.http.get<Conversation[]>(`/conversations/user/${userId}`, {
        headers: this.headers[clientId],
        params: { limit }
      })
    ).data.map((x) => this.deserializeConversation(x))
  }

  async createMessage(
    clientId: uuid,
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    flags?: { incomingId: uuid }
  ): Promise<Message> {
    return this.deserializeMessage(
      (
        await this.http.post<Message>(
          '/messages',
          { conversationId, authorId, payload, incomingId: flags?.incomingId },
          { headers: this.headers[clientId] }
        )
      ).data
    )
  }

  async getMessage(clientId: uuid, id: uuid): Promise<Message | undefined> {
    return handleNotFound(async () => {
      return this.deserializeMessage(
        (await this.http.get<Message>(`/messages/${id}`, { headers: this.headers[clientId] })).data
      )
    }, undefined)
  }

  async listMessages(clientId: uuid, conversationId: uuid, limit?: number) {
    return (
      await this.http.get<Message[]>(`/messages/conversation/${conversationId}`, {
        headers: this.headers[clientId],
        params: { limit }
      })
    ).data.map((x) => this.deserializeMessage(x))
  }

  async deleteMessage(clientId: uuid, id: uuid): Promise<boolean> {
    return handleNotFound(async () => {
      await this.http.delete<boolean>(`/messages/${id}`, { headers: this.headers[clientId] })
      return true
    }, false)
  }

  async deleteMessagesByConversation(clientId: uuid, conversationId: uuid): Promise<number> {
    return handleNotFound(async () => {
      return (
        await this.http.delete<{ count: number }>(`/messages/conversation/${conversationId}`, {
          headers: this.headers[clientId]
        })
      ).data.count
    }, 0)
  }

  async endTurn(clientId: uuid, id: uuid) {
    await this.http.post(`/messages/turn/${id}`, undefined, { headers: this.headers[clientId] })
  }

  async mapEndpoint(clientId: uuid, endpoint: Endpoint): Promise<uuid> {
    return (await this.http.post<{ conversationId: uuid }>('/endpoints', endpoint, { headers: this.headers[clientId] }))
      .data.conversationId
  }

  async revmapEndpoint(clientId: uuid, conversationId: uuid): Promise<Endpoint[]> {
    return (
      await this.http.post<Endpoint[]>(
        '/endpoints/reverse',
        { conversationId },
        {
          headers: this.headers[clientId]
        }
      )
    ).data
  }

  protected deserializeHealth(report: HealthReport) {
    for (const channel of Object.keys(report.channels)) {
      report.channels[channel].events = report.channels[channel].events.map((x) => ({ ...x, time: new Date(x.time) }))
    }

    return report
  }

  protected deserializeConversation(conversation: Conversation): Conversation {
    return {
      ...conversation,
      createdOn: new Date(conversation.createdOn)
    }
  }

  protected deserializeMessage(message: Message): Message {
    return {
      ...message,
      sentOn: new Date(message.sentOn)
    }
  }
}
