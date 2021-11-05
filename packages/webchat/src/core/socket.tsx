import { MessagingSocket } from '@botpress/messaging-socket'
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

    // TODO: change this hardcoded stuff
    const options = { url: 'http://localhost:3100', clientId: 'a9c2ea19-8854-4ab9-aeaf-aa043e1b435c' }

    this.socket = new MessagingSocket(options)
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
      await this.socket.connect()

      const userId = this.socket.userId!
      window.__BP_VISITOR_ID = userId
      this.onUserIdChanged(userId)
      this.postToParent('', { userId })
      resolve()
    })

    return this.waitingForUser
  }
}
