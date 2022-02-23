import { Message, MessagingSocket, UserCredentials } from '@botpress/messaging-socket'
import { Config } from '../typings'

export default class BpSocket {
  public socket: MessagingSocket
  private chatId: string | undefined
  private waitingForUser?: Promise<void>

  public onClear!: (event: any) => void
  public onMessage!: (event: any) => void
  public onTyping!: (event: any) => void
  public onData!: (event: any) => void
  public onUserIdChanged!: (userId: string) => void

  constructor(config: Config) {
    this.chatId = config.chatId
    this.socket = new MessagingSocket({ url: config.messagingUrl, clientId: config.clientId })
  }

  public setup() {
    this.socket.on('message', this.onMessage)

    /*
    this.events.on('guest.webchat.clear', this.onClear)
    this.events.on('guest.webchat.message', this.onMessage)
    this.events.on('guest.webchat.typing', this.onTyping)
    this.events.on('guest.webchat.data', this.onData)
    */

    // firehose events to parent page
    // TODO: why do we need this
    // this.events.onAny(this.postToParent)
  }

  public async sendPayload(payload: any): Promise<Message> {
    const message = await this.socket.sendPayload(payload)
    this.onMessage(message)
    return message
  }

  public postToParent = (_type: string, payload: any) => {
    // we could filter on event type if necessary
    window.parent?.postMessage({ ...payload, chatId: this.chatId }, '*')
  }

  /** Waits until the VISITOR ID and VISITOR SOCKET ID is set  */
  public async waitForUserId(): Promise<void> {
    if (this.waitingForUser) {
      return this.waitingForUser
    }

    this.waitingForUser = new Promise<void>(async (resolve, reject) => {
      const creds = window.BP_STORAGE.get<UserCredentials>('creds')
      await this.socket.connect(creds)

      if (this.socket.userId) {
        const userId = this.socket.userId!
        window.BP_STORAGE.set('creds', this.socket.creds)

        this.onUserIdChanged(userId)
        this.postToParent('', { userId })

        resolve()
      } else {
        this.waitingForUser = undefined
        reject()
      }
    })

    return this.waitingForUser
  }
}
