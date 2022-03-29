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
import { AxiosRequestConfig } from 'axios'
import { Router } from 'express'
import { MessageFeedbackEvent } from '.'
import { MessagingChannel } from './channel'
import { ProtectedEmitter } from './emitter'
import { ConversationStartedEvent, MessageNewEvent, UserNewEvent } from './events'
import { Logger } from './logger'
import { MessagingOptions } from './options'

export class MessagingClient extends ProtectedEmitter<{
  user: UserNewEvent
  started: ConversationStartedEvent
  message: MessageNewEvent
  feedback: MessageFeedbackEvent
}> {
  /** Client id configured for this instance */
  public get clientId() {
    return this._options.clientId
  }
  public set clientId(val: uuid) {
    this._options.clientId = val
    this.applyOptions()
  }

  /** Client token of to authenticate requests made with the client id */
  public get clientToken() {
    return this._options.clientToken
  }
  public set clientToken(val: string | undefined) {
    this._options.clientToken = val
    this.applyOptions()
  }

  /** Webhook token to validate webhook events that are received */
  public get webhookToken() {
    return this._options.webhookToken
  }
  public set webhookToken(val: string | undefined) {
    this._options.webhookToken = val
    this.applyOptions()
  }

  /** Options that are currently applied */
  public get options() {
    return this._options
  }
  public set options(val: MessagingOptions) {
    this.channel.options = val
    this.applyOptions()
  }

  /** Base url of the messaging server */
  public get url() {
    return this.channel.url
  }
  public set url(val: string) {
    this.channel.url = val
  }

  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  public get axios() {
    return this.channel.axios
  }
  public set axios(val: Omit<AxiosRequestConfig, 'baseURL'> | undefined) {
    this.channel.axios = val
  }

  /** Logger interface that can be used to get better debugging. Optional */
  public get logger() {
    return this.channel.logger
  }
  public set logger(val: Logger | undefined) {
    this.channel.logger = val
  }

  /** Name of the cookie for sticky sessions */
  public get sessionCookieName() {
    return this.channel.sessionCookieName
  }
  public set sessionCookieName(val: string | undefined) {
    this.channel.sessionCookieName = val
  }

  protected readonly channel: MessagingChannel
  protected _options: MessagingOptions

  constructor(options: MessagingOptions) {
    super()
    this.channel = new MessagingChannel(options)
    this.channel.on('user', async (_, e) => this.emit('user', e))
    this.channel.on('started', async (_, e) => this.emit('started', e))
    this.channel.on('message', async (_, e) => this.emit('message', e))
    this.channel.on('feedback', async (_, e) => this.emit('feedback', e))

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

  /**
   * Sets up an express router to receive webhook events
   * @param router an express router
   * @param route optional route to receive events at
   */
  setup(router: Router, route?: string) {
    this.channel.setup(router, route)
  }

  /**
   * Configures channels and webhooks
   * @param config channel and webhook configs
   * @returns a list of webhook tokens
   */
  async sync(config: SyncRequest): Promise<SyncResult> {
    return this.channel.sync(this.clientId, config)
  }

  /**
   * Polls health events
   * @returns a list of health events per channel
   */
  async getHealth(): Promise<HealthReport> {
    return this.channel.getHealth(this.clientId)
  }

  /**
   * Creates a new messaging user
   * @returns info of the newly created user
   */
  async createUser(): Promise<User> {
    return this.channel.createUser(this.clientId)
  }

  /**
   * Fetches a messaging user
   * @param id id of the user to fetch
   * @returns info of the user or `undefined` if not found
   */
  async getUser(id: uuid): Promise<User | undefined> {
    return this.channel.getUser(this.clientId, id)
  }

  /**
   * Creates a new user token
   * @param userId id of the user
   * @returns token that can be used to make user-level requests
   */
  async createUserToken(userId: uuid): Promise<{ id: string; token: string }> {
    return this.channel.createUserToken(this.clientId, userId)
  }

  /**
   * Creates a new messaging conversation
   * @param userId id of the user that starts this conversation
   * @returns info of the newly created conversation
   */
  async createConversation(userId: uuid): Promise<Conversation> {
    return this.channel.createConversation(this.clientId, userId)
  }

  /**
   * Fetches a messaging conversation
   * @param id id of the conversation to fetch
   * @returns info of the conversation or `undefined` if not found
   */
  async getConversation(id: uuid): Promise<Conversation | undefined> {
    return this.channel.getConversation(this.clientId, id)
  }

  /**
   * Lists the conversations that a user participates in
   * @param userId id of the user that participates in the conversations
   * @param limit max amount of conversations to list (default 20)
   * @returns an array of conversations
   */
  async listConversations(userId: uuid, limit?: number): Promise<Conversation[]> {
    return this.channel.listConversations(this.clientId, userId, limit)
  }

  /**
   * Sends a message to the messaging server
   * @param conversationId id of the conversation to post the message to
   * @param authorId id of the message autor. `undefined` if bot
   * @param payload content of the message
   * @param flags message flags
   * @returns info of the created message
   */
  async createMessage(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    flags?: { incomingId: uuid }
  ): Promise<Message> {
    return this.channel.createMessage(this.clientId, conversationId, authorId, payload, flags)
  }

  /**
   * Fetches a message
   * @param id id of the message to fetch
   * @returns info of the message or `undefined` if not found
   */
  async getMessage(id: uuid): Promise<Message | undefined> {
    return this.channel.getMessage(this.clientId, id)
  }

  /**
   * Lists the messages of a conversation
   * @param conversationId id of the conversation that owns the messages
   * @param limit max amount of messages to list (default 20)
   * @returns an array of conversations
   */
  async listMessages(conversationId: uuid, limit?: number) {
    return this.channel.listMessages(this.clientId, conversationId, limit)
  }

  /**
   * Deletes a message
   * @param id id of the message to delete
   * @returns `true` if a message was deleted
   */
  async deleteMessage(id: uuid): Promise<boolean> {
    return this.channel.deleteMessage(this.clientId, id)
  }

  /**
   * Deletes all messages of a conversation
   * @param conversationId id of the conversation that owns the messages
   * @returns amount of messages deleted
   */
  async deleteMessagesByConversation(conversationId: uuid): Promise<number> {
    return this.channel.deleteMessagesByConversation(this.clientId, conversationId)
  }

  /**
   * When using converse, ends the answering turn of a message, terminating
   * the waiting period and returning all payloads that were collected
   * @param id id of the incoming message that has finished being answered
   */
  async endTurn(id: uuid) {
    return this.channel.endTurn(this.clientId, id)
  }

  /**
   * Maps an endpoint to a conversation id. Calling this function with the
   * same endpoint always returns the same conversation id
   * @param endpoint endpoint to be mapped
   * @returns a conversation id associated to the endpoint
   */
  async mapEndpoint(endpoint: Endpoint): Promise<uuid> {
    return this.channel.mapEndpoint(this.clientId, endpoint)
  }

  /**
   * Lists the endpoints associated to a conversation
   * @param conversationId id of the conversation that is associated with the endpoints
   * @returns an array of endpoints that are linked to the provided conversation
   */
  async listEndpoints(conversationId: uuid): Promise<Endpoint[]> {
    return this.channel.listEndpoints(this.clientId, conversationId)
  }
}
