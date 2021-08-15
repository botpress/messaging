import { SocketCom } from './com'

export class BaseSocket {
  constructor(protected com: SocketCom) {}

  protected request<T>(type: string, data: any) {
    return this.com.request<T>(type, data)
  }
}
