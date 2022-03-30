import { Message, MessagingSocket, UserCredentials } from '@botpress/messaging-socket'
import { Config } from '../typings'

export default class BpSocket {
  public socket: MessagingSocket
  private chatId: string | undefined

  public onMessage!: (event: any) => void

  constructor(private config: Config) {
    this.chatId = config.chatId
    this.socket = new MessagingSocket({ url: config.messagingUrl, clientId: config.clientId })

    window.websocket = this.socket
  }

  public setup() {
    this.socket.on('message', this.onMessage)
  }

  public async sendPayload(payload: any): Promise<Message> {
    const message = await this.socket.sendPayload(payload)
    this.onMessage(message)
    return message
  }

  public postToParent = (_type: string, payload: any) => {
    window.parent?.postMessage({ ...payload, chatId: this.chatId }, '*')
  }

  public async connect(): Promise<void> {
    const creds = this.getCreds()
    await this.socket.connect(creds)

    if (this.socket.userId) {
      const userId = this.socket.userId!
      window.BP_STORAGE.set('creds', this.socket.creds)

      this.postToParent('', { userId })
    }
  }

  public async reload(config: Config) {
    this.config = config
    const creds = this.getCreds()

    if (creds?.userId !== this.socket.userId || creds?.userToken !== this.socket.creds?.userToken) {
      await this.socket.disconnect()
      await this.connect()
    }
  }

  private getCreds() {
    return this.config.customUser || window.BP_STORAGE.get<UserCredentials>('creds')
  }
}
