import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ChatClient } from './chat'
import { ConversationClient } from './conversations'
import { HealthClient } from './health'
import { MessageClient } from './messages'
import { SyncClient } from './sync'
import { UserClient } from './users'

export class MessagingClient {
  http: AxiosInstance
  authHttp: AxiosInstance
  syncs: SyncClient
  health: HealthClient
  chat: ChatClient
  users: UserClient
  conversations: ConversationClient
  messages: MessageClient

  constructor(options: MessagingOptions) {
    const { url, password, auth } = options

    this.http = axios.create(this.getAxiosConfig({ url, password }))
    this.authHttp = axios.create(this.getAxiosConfig({ url, password, auth }))

    this.syncs = new SyncClient(this.http)
    this.health = new HealthClient(this.authHttp)
    this.chat = new ChatClient(this.authHttp)
    this.users = new UserClient(this.authHttp)
    this.conversations = new ConversationClient(this.authHttp)
    this.messages = new MessageClient(this.authHttp)
  }

  private getAxiosConfig({ url, password, auth }: MessagingOptions): AxiosRequestConfig {
    const config: AxiosRequestConfig = { baseURL: `${url}/api`, headers: {} }

    if (password) {
      config.headers.password = password
    }

    if (auth) {
      config.headers['x-bp-messaging-client-id'] = auth.clientId
      config.headers['x-bp-messaging-client-token'] = auth.clientToken
    }

    return config
  }
}

export interface MessagingOptions {
  /** Base url of the messaging server */
  url: string
  /** Internal password of the messaging server. Optional */
  password?: string
  /** Client authentication to access client owned resources. Optional */
  auth?: {
    clientId: string
    clientToken: string
  }
}
