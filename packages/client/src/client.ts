import { Conversation, HealthReport, Message, SyncRequest, SyncResult, User, uuid } from '@botpress/messaging-base'
import { Router } from 'express'
import { MessagingClientAuth } from '.'
import { MessagingChannel } from './channel'
import { ProtectedEmitter } from './emitter'
import { ConversationStartedEvent, MessageNewEvent, UserNewEvent } from './events'
import { MessagingOptions } from './options'

export class MessagingClient extends ProtectedEmitter<{
  user: UserNewEvent
  started: ConversationStartedEvent
  message: MessageNewEvent
}> {
  public get clientId(): uuid {
    return this._clientId
  }
  public get creds(): MessagingClientAuth {
    return this._creds
  }

  protected readonly channel: MessagingChannel
  protected readonly _clientId: uuid
  protected readonly _creds: MessagingClientAuth

  constructor(options: MessagingOptions) {
    super()
    this.channel = new MessagingChannel(options)
    this.channel.on('user', async (_, e) => this.emit('user', e))
    this.channel.on('started', async (_, e) => this.emit('started', e))
    this.channel.on('message', async (_, e) => this.emit('message', e))

    this._clientId = options.clientId
    this._creds = { clientToken: options.clientToken, webhookToken: options.webhookToken }
    this.channel.start(this._clientId, this._creds)
  }

  setup(router: Router, route?: string) {
    this.channel.setup(router, route)
  }

  async sync(config: ClientSyncRequest): Promise<SyncResult> {
    return this.channel.sync({ ...config, id: this._clientId, token: this._creds.clientToken })
  }

  async getHealth(): Promise<HealthReport> {
    return this.channel.getHealth(this._clientId)
  }

  async createUser(): Promise<User> {
    return this.channel.createUser(this._clientId)
  }

  async getUser(id: uuid): Promise<User | undefined> {
    return this.channel.getUser(this._clientId, id)
  }

  async createConversation(userId: uuid): Promise<Conversation> {
    return this.channel.createConversation(this._clientId, userId)
  }

  async getConversation(id: uuid): Promise<Conversation | undefined> {
    return this.channel.getConversation(this._clientId, id)
  }

  async listConversations(userId: uuid, limit?: number): Promise<Conversation[]> {
    return this.channel.listConversations(this._clientId, userId, limit)
  }

  async createMessage(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    flags?: { incomingId: uuid }
  ): Promise<Message> {
    return this.channel.createMessage(this._clientId, conversationId, authorId, payload, flags)
  }

  async getMessage(id: uuid): Promise<Message | undefined> {
    return this.channel.getMessage(this._clientId, id)
  }

  async listMessages(conversationId: uuid, limit?: number) {
    return this.channel.listMessages(this._clientId, conversationId, limit)
  }

  async deleteMessage(id: uuid): Promise<boolean> {
    return this.channel.deleteMessage(this._clientId, id)
  }

  async deleteMessagesByConversation(conversationId: uuid): Promise<number> {
    return this.channel.deleteMessagesByConversation(this._clientId, conversationId)
  }

  async endTurn(id: uuid) {
    return this.channel.endTurn(this._clientId, id)
  }
}

export type ClientSyncRequest = Omit<SyncRequest, 'id' | 'token'>
