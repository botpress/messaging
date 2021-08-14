import { SocketCom } from './com/com'
import { MessagingSocketAuth } from './socket'

export class BaseSocket {
  constructor(protected com: SocketCom, protected auths: MessagingSocketAuth) {}

  protected request<T>(type: string, data: any) {
    return this.com.request<T>(type, { ...this.auths, ...data })
  }
}
