import axios, { AxiosInstance } from 'axios'
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
    const { url, password, auth: authentication } = options

    const headers = password ? { password } : {}
    const auth = authentication
      ? { username: authentication.clientId, password: authentication.clientToken }
      : undefined

    this.http = axios.create({ baseURL: `${url}/api`, headers })
    this.authHttp = axios.create({
      baseURL: `${url}/api`,
      headers,
      auth
    })

    this.syncs = new SyncClient(this.http)
    this.health = new HealthClient(this.authHttp)
    this.chat = new ChatClient(this.authHttp)
    this.users = new UserClient(this.authHttp)
    this.conversations = new ConversationClient(this.authHttp)
    this.messages = new MessageClient(this.authHttp)
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
