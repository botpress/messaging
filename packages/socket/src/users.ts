import { User, uuid } from '@botpress/messaging-base'
import { SocketCom } from '.'
import { BaseSocket } from './base'

export class UserSocket extends BaseSocket {
  constructor(com: SocketCom, private clientId: uuid) {
    super(com)
  }

  public async auth(info?: UserInfo): Promise<UserInfo> {
    const result = await this.request<UserInfo>('users.auth', {
      clientId: this.clientId,
      ...(info || {})
    })

    if (result.id === info?.id && !result.token) {
      result.token = info.token
    }

    return result
  }
}

export interface UserInfo {
  id: uuid
  token: string
}
