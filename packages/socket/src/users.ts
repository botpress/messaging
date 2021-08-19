import { User, uuid } from '@botpress/messaging-base'
import { SocketCom } from '.'
import { BaseSocket } from './base'

export class UserSocket extends BaseSocket {
  constructor(com: SocketCom, private clientId: uuid) {
    super(com)
  }

  public async auth(userId: uuid | undefined, userToken: string | undefined): Promise<User> {
    return this.request<User>('users.auth', {
      clientId: this.clientId,
      userId,
      userToken
    })
  }
}
