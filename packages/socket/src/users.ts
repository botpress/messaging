import { User, uuid } from '@botpress/messaging-base'
import { BaseSocket } from './base'

export class UserSocket extends BaseSocket {
  public async auth(userId: uuid | undefined, userToken: string | undefined): Promise<User> {
    const user = await this.request<User>('users.auth', {
      userId,
      userToken
    })

    this.auths.userId = user.id
    // this.auths.userToken = (<any>user).token || userToken

    return user
  }
}
