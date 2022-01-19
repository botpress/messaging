import { Conversation, HealthReport, Message, SyncRequest, SyncResult, User, uuid } from '@botpress/messaging-base'
import { AxiosRequestConfig } from 'axios'
import { Router } from 'express'
import { MessagingChannel } from './channel'
import { ProtectedEmitter } from './emitter'
import { ConversationStartedEvent, MessageNewEvent, UserNewEvent } from './events'
import { MessagingOptions } from './options'

export class MessagingClient extends ProtectedEmitter<{
  user: UserNewEvent
  started: ConversationStartedEvent
  message: MessageNewEvent
}> {
  public get options() {
    return this._options
  }
  public set options(val: MessagingOptions) {
    this._options = val
    this.applyOptions()
  }

  public get clientId() {
    return this._options.clientId
  }
  public set clientId(val: uuid) {
    this._options.clientId = val
    this.applyOptions()
  }

  public get clientToken() {
    return this._options.clientToken
  }
  public set clientToken(val: string | undefined) {
    this._options.clientToken = val
    this.applyOptions()
  }

  public get webhookToken() {
    return this._options.webhookToken
  }
  public set webhookToken(val: string | undefined) {
    this._options.webhookToken = val
    this.applyOptions()
  }

  public get url() {
    return this._options.url
  }
  public set url(val: string) {
    this._options.url = val
    this.applyOptions()
  }

  public get axios() {
    return this._options.axios
  }
  public set axios(val: Omit<AxiosRequestConfig, 'baseURL'> | undefined) {
    this._options.axios = val
    this.applyOptions()
  }

  protected readonly channel: MessagingChannel
  protected _options: MessagingOptions

  constructor(options: MessagingOptions) {
    super()
    this.channel = new MessagingChannel(options)
    this.channel.on('user', async (_, e) => this.emit('user', e))
    this.channel.on('started', async (_, e) => this.emit('started', e))
    this.channel.on('message', async (_, e) => this.emit('message', e))

    this._options = options
    this.applyOptions()
  }

  private applyOptions() {
    if (this.channel.has(this.clientId)) {
      this.channel.stop(this.clientId)
    }

    const creds = { clientToken: this.options.clientToken, webhookToken: this.options.webhookToken }
    this.channel.start(this.clientId, creds)
  }

  setup(router: Router, route?: string) {
    this.channel.setup(router, route)
  }

  async sync(config: SyncRequest): Promise<SyncResult> {
    return this.channel.sync(this.clientId, config)
  }

  async getHealth(): Promise<HealthReport> {
    return this.channel.getHealth(this.clientId)
  }

  async createUser(): Promise<User> {
    return this.channel.createUser(this.clientId)
  }

  async getUser(id: uuid): Promise<User | undefined> {
    return this.channel.getUser(this.clientId, id)
  }

  async createConversation(userId: uuid): Promise<Conversation> {
    return this.channel.createConversation(this.clientId, userId)
  }

  async getConversation(id: uuid): Promise<Conversation | undefined> {
    return this.channel.getConversation(this.clientId, id)
  }

  async listConversations(userId: uuid, limit?: number): Promise<Conversation[]> {
    return this.channel.listConversations(this.clientId, userId, limit)
  }

  async createMessage(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    flags?: { incomingId: uuid }
  ): Promise<Message> {
    return this.channel.createMessage(this.clientId, conversationId, authorId, payload, flags)
  }

  async getMessage(id: uuid): Promise<Message | undefined> {
    return this.channel.getMessage(this.clientId, id)
  }

  async listMessages(conversationId: uuid, limit?: number) {
    return this.channel.listMessages(this.clientId, conversationId, limit)
  }

  async deleteMessage(id: uuid): Promise<boolean> {
    return this.channel.deleteMessage(this.clientId, id)
  }

  async deleteMessagesByConversation(conversationId: uuid): Promise<number> {
    return this.channel.deleteMessagesByConversation(this.clientId, conversationId)
  }

  async endTurn(id: uuid) {
    return this.channel.endTurn(this.clientId, id)
  }
}
