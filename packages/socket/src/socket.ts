import { SocketCom } from './com/com'

export class MessagingSocket {
  public readonly com: SocketCom

  constructor(options: MessagingSocketOptions) {
    this.com = new SocketCom(options.url, options.manualConnect)
  }
}

export interface MessagingSocketOptions {
  url: string
  manualConnect: boolean
}
