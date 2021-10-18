import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import yn from 'yn'
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
  users: UserClient
  conversations: ConversationClient
  messages: MessageClient

  constructor(options: MessagingOptions) {
    const { url, auth, client, password } = options

    this.http = this.configureHttpClient(client, this.getAxiosConfig({ url, password }))
    this.authHttp = this.configureHttpClient(client, this.getAxiosConfig({ url, auth, password }))

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
    this.authHttp.defaults.headers['x-bp-messaging-client-id'] = clientId
    this.authHttp.defaults.headers['x-bp-messaging-client-token'] = clientToken
  }

  private configureHttpClient(client: AxiosInstance | undefined, config: AxiosRequestConfig) {
    const localConfig: AxiosRequestConfig = {}
    if (yn(process.env.SPINNED)) {
      localConfig.proxy = false
    }

    if (client) {
      client.defaults = { ...client.defaults, ...config, ...localConfig }
      return client
    } else {
      return axios.create({ ...config, ...localConfig })
    }
  }

  private getAxiosConfig({ url, password }: MessagingOptions): AxiosRequestConfig {
    return { baseURL: `${url}/api`, headers: password ? { password } : {} }
  }
}

export interface MessagingOptions {
  /** Base url of the messaging server */
  url: string
  /** Client authentication to access client owned resources. Optional */
  auth?: MessagingAuth
  /** A custom axios instance giving more control over the HTTP client used internally. Optional */
  client?: AxiosInstance
  /** Internal password of the messaging server. Optional */
  password?: string
}

export interface MessagingAuth {
  clientId: string
  clientToken: string
}
