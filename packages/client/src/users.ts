import { User } from '@botpress/messaging-base'
import { BaseClient } from './base'

export class UserClient extends BaseClient {
  async create(): Promise<User> {
    return (await this.http.post('/users')).data
  }
}
