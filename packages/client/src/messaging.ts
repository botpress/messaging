import axios, { AxiosInstance } from 'axios'
import { ChatClient } from './chat'
import { ConversationClient } from './conversations'
import { MessageClient } from './messages'
import { SyncClient } from './sync'
import { UserClient } from './users'

export class MessagingClient {
  http: AxiosInstance
  authHttp: AxiosInstance
  syncs: SyncClient
  chat: ChatClient
  users: UserClient
  conversations: ConversationClient
  messages: MessageClient

  constructor(options: MessagingOptions) {
    const { url, password, auth } = options

    this.http = axios.create({ baseURL: `${url}/api`, headers: { password } })
    this.authHttp = axios.create({
      baseURL: `${url}/api`,
      headers: { password },
      auth: { username: auth?.clientId!, password: auth?.clientToken! }
    })

    this.syncs = new SyncClient(this.http)
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
  /** Client authentification to access client owned ressources. Optional */
  auth?: {
    clientId: string
    clientToken: string
  }
}
