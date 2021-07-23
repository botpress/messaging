import { BaseClient } from './base'

export class UserClient extends BaseClient {
  async create(): Promise<User> {
    return (await this.http.post('/users')).data
  }
}

export interface User {
  id: string
  clientId: string
}
