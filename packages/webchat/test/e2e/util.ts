import axios from 'axios'
import { Config } from '../../src/index'

interface Client {
  id: string
  token: string
}

const DEFAULT_CONFIG: Config = {
  messagingUrl: 'http://localhost:3100',
  clientId: ''
}

export const TYPING_DELAY = 2000

export class Util {
  private _config: Config
  private _window: typeof window
  private client!: Client

  constructor() {
    this._config = DEFAULT_CONFIG
    this._window = window
  }

  get window() {
    return this._window
  }

  set window(window: any) {
    this._window = window
  }

  private get userId(): string {
    return this.window.websocket.userId
  }

  private get conversationId(): string {
    return this.window.websocket.conversationId
  }

  get config() {
    return this._config
  }

  set config(config: Partial<Config>) {
    this._config = { ...this._config, ...config }
  }

  public async setup() {
    this.client = await axios
      .post<Client>(`${DEFAULT_CONFIG.messagingUrl}/api/v1/admin/clients`)
      .then((res) => res.data)

    this.config = { clientId: this.client.id }
  }

  sendMessage = async (message: string, { sendAsUser }: { sendAsUser: boolean } = { sendAsUser: false }) => {
    return axios.post(
      `${DEFAULT_CONFIG.messagingUrl}/api/v1/messages`,
      {
        authorId: sendAsUser ? this.userId : undefined,
        conversationId: this.conversationId,
        payload: {
          type: 'text',
          text: message
        }
      },
      {
        headers: this.getAuthHeaders()
      }
    )
  }

  private getAuthHeaders() {
    return {
      'x-bp-messaging-client-id': this.client.id,
      'x-bp-messaging-client-token': this.client.token
    }
  }
}
