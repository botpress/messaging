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
import { handleUnauthorized } from '.'
import { MessagingChannelBase } from './base'
import { handleNotFound } from './errors'

export abstract class MessagingChannelApi extends MessagingChannelBase {
  /**
   * Creates a new client
   * @param id Id of the client
   * @returns Id and token of the created client
   */
  async createClient(id?: uuid): Promise<{ id: uuid; token: string }> {
    return (await this.http.post('/admin/clients', { id }, { headers: this.adminHeader })).data
  }

  /**
   * Renames a client
   * @param id Id of the client
   * @param name Name of the client
   */
  async renameClient(clientId: uuid, name: string): Promise<void> {
    await this.http.put('/admin/clients/name', { id: clientId, name }, { headers: this.adminHeader })
  }

  /**
   * Tests a client's credentials
   * @param clientId id of the client to test
   * @returns true if the client's credentials are valid
   */
  async getClient(clientId: uuid): Promise<boolean> {
    return handleUnauthorized(async () => {
      await this.http.get<User>('/clients', { headers: this.headers[clientId] })
      return true
    }, false)
  }

  /**
   * Synchronize a client with channel and webhook configs
   * @param clientId id of the client to configure
   * @param config channel and webhook configs
   * @returns a list of webhook tokens
   */
  async sync(clientId: uuid, config: SyncRequest): Promise<SyncResult> {
    return (await this.http.post('/sync', config, { headers: this.headers[clientId] })).data
  }

  /**
   * Polls health events for a client
   * @param clientId id of the client to poll
   * @returns a list of health events per channel
   */
  async getHealth(clientId: uuid): Promise<HealthReport> {
    return this.deserializeHealth(
      (await this.http.get<HealthReport>('/health', { headers: this.headers[clientId] })).data
    )
  }

  /**
   * Creates a new messaging user
   * @param clientId id of the client that will own the user
   * @returns info of the newly created user
   */
  async createUser(clientId: uuid): Promise<User> {
    return (await this.http.post<User>('/users', undefined, { headers: this.headers[clientId] })).data
  }

  /**
   * Fetches a messaging user
   * @param clientId id of the client that owns the user
   * @param id id of the user to fetch
   * @returns info of the user or `undefined` if not found
   */
  async getUser(clientId: uuid, id: uuid): Promise<User | undefined> {
    return handleNotFound(async () => {
      return (await this.http.get<User>(`/users/${id}`, { headers: this.headers[clientId] })).data
    }, undefined)
  }

  /**
   * Creates a new user token
   * @param clientId id of the client that owns the user
   * @param userId id of the user
   * @returns token that can be used to make user-level requests
   */
  async createUserToken(clientId: uuid, userId: uuid): Promise<{ id: string; token: string }> {
    return (await this.http.post('/users/tokens', { userId }, { headers: this.headers[clientId] })).data
  }

  /**
   * Creates a new messaging conversation
   * @param clientId id of the client that will own this conversation
   * @param userId id of the user that starts this conversation
   * @returns info of the newly created conversation
   */
  async createConversation(clientId: uuid, userId: uuid): Promise<Conversation> {
    return this.deserializeConversation(
      (await this.http.post<Conversation>('/conversations', { userId }, { headers: this.headers[clientId] })).data
    )
  }

  /**
   * Fetches a messaging conversation
   * @param clientId id of the client that owns the conversation
   * @param id id of the conversation to fetch
   * @returns info of the conversation or `undefined` if not found
   */
  async getConversation(clientId: uuid, id: uuid): Promise<Conversation | undefined> {
    return handleNotFound(async () => {
      return this.deserializeConversation(
        (await this.http.get<Conversation>(`/conversations/${id}`, { headers: this.headers[clientId] })).data
      )
    }, undefined)
  }

  /**
   * Lists the conversations that a user participates in
   * @param clientId id of the client that owns the user
   * @param userId id of the user that participates in the conversations
   * @param limit max amount of conversations to list (default 20)
   * @returns an array of conversations
   */
  async listConversations(clientId: uuid, userId: uuid, limit?: number): Promise<Conversation[]> {
    return (
      await this.http.get<Conversation[]>(`/conversations/user/${userId}`, {
        headers: this.headers[clientId],
        params: { limit }
      })
    ).data.map((x) => this.deserializeConversation(x))
  }

  /**
   * Sends a message to the messaging server
   * @param clientId id of the client that owns the conversation
   * @param conversationId id of the conversation to post the message to
   * @param authorId id of the message autor. `undefined` if bot
   * @param payload content of the message
   * @param flags message flags for converse
   * @returns info of the created message
   */
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

  /**
   * Fetches a message
   * @param clientId id of the client that owns the message
   * @param id id of the message to fetch
   * @returns info of the message or `undefined` if not found
   */
  async getMessage(clientId: uuid, id: uuid): Promise<Message | undefined> {
    return handleNotFound(async () => {
      return this.deserializeMessage(
        (await this.http.get<Message>(`/messages/${id}`, { headers: this.headers[clientId] })).data
      )
    }, undefined)
  }

  /**
   * Lists the messages of a conversation
   * @param clientId id of the client that owns the conversation
   * @param conversationId id of the conversation that owns the messages
   * @param limit max amount of messages to list (default 20)
   * @returns an array of conversations
   */
  async listMessages(clientId: uuid, conversationId: uuid, limit?: number) {
    return (
      await this.http.get<Message[]>(`/messages/conversation/${conversationId}`, {
        headers: this.headers[clientId],
        params: { limit }
      })
    ).data.map((x) => this.deserializeMessage(x))
  }

  /**
   * Deletes a message
   * @param clientId id of the client that owns the message
   * @param id id of the message to delete
   * @returns `true` if a message was deleted
   */
  async deleteMessage(clientId: uuid, id: uuid): Promise<boolean> {
    return handleNotFound(async () => {
      await this.http.delete<boolean>(`/messages/${id}`, { headers: this.headers[clientId] })
      return true
    }, false)
  }

  /**
   * Deletes all messages of a conversation
   * @param clientId id of the client that owns the conversation
   * @param conversationId id of the conversation that owns the messages
   * @returns amount of messages deleted
   */
  async deleteMessagesByConversation(clientId: uuid, conversationId: uuid): Promise<number> {
    return handleNotFound(async () => {
      return (
        await this.http.delete<{ count: number }>(`/messages/conversation/${conversationId}`, {
          headers: this.headers[clientId]
        })
      ).data.count
    }, 0)
  }

  /**
   * When using converse, ends the answering turn of a message, terminating
   * the waiting period and returning all payloads that were collected
   * @param clientId id of the client that owns the message
   * @param id id of the incoming message that has finished being answered
   */
  async endTurn(clientId: uuid, id: uuid) {
    await this.http.post(`/messages/turn/${id}`, undefined, { headers: this.headers[clientId] })
  }

  /**
   * Maps an endpoint to a conversation id. Calling this function with the
   * same endpoint always returns the same conversation id
   * @param clientId id of the client on which to do the mapping
   * @param endpoint endpoint to be mapped
   * @returns a conversation id associated to the endpoint
   */
  async mapEndpoint(clientId: uuid, endpoint: Endpoint): Promise<uuid> {
    return (
      await this.http.post<{ conversationId: uuid }>('/endpoints/map', endpoint, { headers: this.headers[clientId] })
    ).data.conversationId
  }

  /**
   * Lists the endpoints associated to a conversation
   * @param clientId id of the client that owns the conversation
   * @param conversationId id of the conversation that is associated with the endpoints
   * @returns an array of endpoints that are linked to the provided conversation
   */
  async listEndpoints(clientId: uuid, conversationId: uuid): Promise<Endpoint[]> {
    return (
      await this.http.get<Endpoint[]>(`/endpoints/conversation/${conversationId}`, {
        headers: this.headers[clientId]
      })
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
