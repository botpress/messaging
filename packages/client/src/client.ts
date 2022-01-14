import { Conversation, HealthReport, Message, SyncRequest, SyncResult, User, uuid } from '@botpress/messaging-base'
import { MessagingChannel, MessagingChannelOptions } from './channel'

export class MessagingClient {
  public get creds(): MessagingClientCredentials {
    return this._creds
  }

  protected readonly channel: MessagingChannel
  protected readonly _creds: MessagingClientCredentials

  constructor(options: MessagingOptions) {
    this.channel = new MessagingChannel(options)
    this._creds = options.creds
    this.channel.start(this._creds.clientId, { clientToken: this.creds.clientToken })
  }

  async sync(config: ClientSyncRequest): Promise<SyncResult> {
    return this.channel.sync({ ...config, id: this._creds.clientId, token: this._creds.clientToken })
  }

  async getHealth(): Promise<HealthReport> {
    return this.channel.getHealth(this._creds.clientId)
  }

  async createUser(): Promise<User> {
    return this.channel.createUser(this._creds.clientId)
  }

  async getUser(id: uuid): Promise<User | undefined> {
    return this.channel.getUser(this._creds.clientId, id)
  }

  async createConversation(userId: uuid): Promise<Conversation> {
    return this.channel.createConversation(this._creds.clientId, userId)
  }

  async getConversation(id: uuid): Promise<Conversation | undefined> {
    return this.channel.getConversation(this._creds.clientId, id)
  }

  async listConversations(userId: uuid, limit?: number): Promise<Conversation[]> {
    return this.channel.listConversations(this._creds.clientId, userId, limit)
  }

  async createMessage(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    flags?: { incomingId: uuid }
  ): Promise<Message> {
    return this.channel.createMessage(this._creds.clientId, conversationId, authorId, payload, flags)
  }

  async getMessage(id: uuid): Promise<Message | undefined> {
    return this.channel.getMessage(this._creds.clientId, id)
  }

  async listMessages(conversationId: uuid, limit?: number) {
    return this.channel.listMessages(this._creds.clientId, conversationId, limit)
  }

  async deleteMessage(id: uuid): Promise<boolean> {
    return this.channel.deleteMessage(this._creds.clientId, id)
  }

  async deleteMessagesByConversation(conversationId: uuid): Promise<number> {
    return this.channel.deleteMessagesByConversation(this._creds.clientId, conversationId)
  }

  async endTurn(id: uuid) {
    return this.channel.endTurn(this._creds.clientId, id)
  }
}

export type ClientSyncRequest = Omit<SyncRequest, 'id' | 'token'>

export interface MessagingOptions extends MessagingChannelOptions {
  /** Client credentials to access client owned resources */
  creds: MessagingClientCredentials
}

export interface MessagingClientCredentials {
  clientId: string
  clientToken: string
}
