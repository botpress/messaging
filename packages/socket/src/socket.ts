import { SocketCom } from './com/com'

export class MessagingSocket {
  public readonly com: SocketCom

  constructor(private url: string) {
    this.com = new SocketCom(this.url)
  }
}
