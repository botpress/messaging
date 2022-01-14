import { Conversation, HealthReport, Message, SyncRequest, SyncResult, User, uuid } from '@botpress/messaging-base'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Router, NextFunction, Request, Response, RequestHandler } from 'express'
import joi from 'joi'
import { Emitter } from './emitter'
import { handleError, handleNotFound } from './errors'

export class MessagingChannel extends Emitter<{ user: any; started: any; message: any }> {
  protected readonly http: AxiosInstance
  protected auths: { [clientId: uuid]: MessagingClientAuth } = {}
  protected headers: { [clientId: uuid]: any } = {}

  constructor(options: MessagingChannelOptions) {
    super()

    const config = this.getAxiosConfig(options)
    this.http = axios.create(config)
    this.http.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        return handleError(error)
      }
    )
  }

  private getAxiosConfig({ url, config }: MessagingChannelOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api` }

    return { ...config, ...defaultConfig }
  }

  setup(router: Router, route?: string) {
    router.post(
      route || '/',
      this.asyncMiddleware(async (req, res) => {
        const clientId = req.headers['x-bp-messaging-client-id'] as string
        const webhookToken = req.headers['x-bp-messaging-webhook-token'] as string
        if (!webhookToken || webhookToken !== this.auths[clientId].webhookToken) {
          return res.sendStatus(403)
        }

        const event: MessagingEvent = req.body

        if (event.type === 'message.new') {
          const { error } = MessageNewEventSchema.validate(event.data)
          if (error) {
            return res.status(400).send(error.message)
          }

          await this.emit('message', { clientId, data: event.data })
        } else if (event.type === 'conversation.started') {
          const { error } = ConversationStartedEventSchema.validate(event.data)
          if (error) {
            return res.status(400).send(error.message)
          }

          await this.emit('started', { clientId, data: event.data })
        } else if (event.type === 'user.new') {
          await this.emit('user', { clientId, data: event.data })
        }

        return res.sendStatus(200)
      })
    )
  }

  protected asyncMiddleware(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(() => {
        return res.sendStatus(500)
      })
    }
  }

  start(clientId: uuid, auth: MessagingClientAuth) {
    this.auths[clientId] = auth
    this.headers[clientId] = {
      'x-bp-messaging-client-id': clientId,
      'x-bp-messaging-client-token': auth.clientToken
    }
  }

  stop(clientId: uuid) {
    delete this.auths[clientId]
    delete this.headers[clientId]
  }

  async sync(config: SyncRequest): Promise<SyncResult> {
    return (await this.http.post('/sync', config)).data
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

export interface MessagingChannelOptions {
  /** Base url of the messaging server */
  url: string
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  config?: Omit<AxiosRequestConfig, 'baseURL'>
}

export interface MessagingClientAuth {
  clientToken?: string
  webhookToken?: string
}

export interface MessageNewEventData {
  userId: uuid
  conversationId: uuid
  channel: string
  message: Message
  collect: boolean
}

interface MessagingEvent {
  type: 'message.new' | 'conversation.started' | 'user.new'
  data: any
}

export interface ConversationStartedEventData {
  userId: uuid
  conversationId: uuid
  channel: string
}

const MessageNewEventSchema = joi
  .object({
    userId: joi.string().required(),
    conversationId: joi.string().required(),
    channel: joi.string().required(),
    collect: joi.boolean().optional(),
    message: joi
      .object({
        id: joi.string().required(),
        conversationId: joi.string().required(),
        authorId: joi.string().required(),
        sentOn: joi.date().required(),
        payload: joi.object().required()
      })
      .required()
  })
  .required()

const ConversationStartedEventSchema = joi
  .object({
    userId: joi.string().required(),
    conversationId: joi.string().required(),
    channel: joi.string().required()
  })
  .required()
