import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ConversationClient } from './conversations'
import { HealthClient } from './health'
import { MessageClient } from './messages'
import { SyncClient } from './sync'
import { UserClient } from './users'

export const CLIENT_ID_HEADER = 'x-bp-messaging-client-id'
export const CLIENT_TOKEN_HEADER = 'x-bp-messaging-client-token'

export class MessagingClient {
  http: AxiosInstance
  authHttp: AxiosInstance
  auth?: MessagingAuth

  syncs: SyncClient
  health: HealthClient
  users: UserClient
  conversations: ConversationClient
  messages: MessageClient

  constructor(options: MessagingOptions) {
    const { auth } = options

    const config = this.getAxiosConfig(options)
    this.http = axios.create(config)
    this.authHttp = axios.create(config)

    if (auth) {
      this.authenticate(auth.clientId, auth.clientToken)
    }

    this.syncs = new SyncClient(this.http)
    this.health = new HealthClient(this.authHttp)
    this.users = new UserClient(this.authHttp)
    this.conversations = new ConversationClient(this.authHttp)
    this.messages = new MessageClient(this.authHttp)
  }

  public authenticate(clientId: string, clientToken: string) {
    this.auth = { clientId, clientToken }
    this.authHttp.defaults.headers.common[CLIENT_ID_HEADER] = clientId
    this.authHttp.defaults.headers.common[CLIENT_TOKEN_HEADER] = clientToken
  }

  private getAxiosConfig({ url, config }: MessagingOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api` }

    return { ...config, ...defaultConfig }
  }
}

export interface MessagingOptions {
  /** Base url of the messaging server */
  url: string
  /** Client authentication to access client owned resources. Optional */
  auth?: MessagingAuth
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  config?: Omit<AxiosRequestConfig, 'baseURL'>
}

export interface MessagingAuth {
  clientId: string
  clientToken: string
}
