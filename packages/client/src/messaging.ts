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
  auth?: MessagingAuth

  syncs: SyncClient
  health: HealthClient
  chat: ChatClient
  users: UserClient
  conversations: ConversationClient
  messages: MessageClient

  constructor(options: MessagingOptions) {
    const { url, auth, client } = options

    this.http = this.configureHttpClient(client, this.getAxiosConfig({ url }))
    this.authHttp = this.configureHttpClient(client, this.getAxiosConfig({ url, auth }))

    if (auth) {
      this.authenticate(auth.clientId, auth.clientToken)
    }

    this.syncs = new SyncClient(this.http)
    this.health = new HealthClient(this.authHttp)
    this.chat = new ChatClient(this.authHttp)
    this.users = new UserClient(this.authHttp)
    this.conversations = new ConversationClient(this.authHttp)
    this.messages = new MessageClient(this.authHttp)
  }

  public authenticate(clientId: string, clientToken: string) {
    this.auth = { clientId, clientToken }
    this.authHttp.defaults.headers['x-bp-messaging-client-id'] = clientId
    this.authHttp.defaults.headers['x-bp-messaging-client-token'] = clientToken
  }

  private configureHttpClient(client: AxiosInstance | undefined, config: AxiosRequestConfig) {
    if (client) {
      client.defaults = { ...client.defaults, ...config }
      return client
    } else {
      return axios.create(config)
    }
  }

  private getAxiosConfig({ url }: MessagingOptions): AxiosRequestConfig {
    return { baseURL: `${url}/api`, headers: {} }
  }
}

export interface MessagingOptions {
  /** Base url of the messaging server */
  url: string
  /** Client authentication to access client owned resources. Optional */
  auth?: MessagingAuth
  /** A custom axios instance giving more control over the HTTP client used internally. Optional */
  client?: AxiosInstance
}

export interface MessagingAuth {
  clientId: string
  clientToken: string
}
