import { Message, MessagingSocket, UserCredentials } from '@botpress/messaging-socket'
import { Config } from '../typings'
import { postMessageToParent } from '../utils/webchatEvents'

export default class BpSocket {
  public socket: MessagingSocket
  private chatId: string

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

  public async connect(): Promise<void> {
    const creds = this.getCreds()
    const userData = this.getUserData()
    await this.socket.connect(creds, userData)

    if (this.socket.userId) {
      const userId = this.socket.userId!
      window.BP_STORAGE.set('creds', this.socket.creds)

      postMessageToParent('USER.CONNECTED', { userId }, this.chatId)
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

  private getUserData() {
    return this.config.userData
  }
}
