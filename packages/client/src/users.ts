import { User } from '@botpress/messaging-base'
import { BaseClient } from './base'
import { handleNotFound } from './errors'

export class UserClient extends BaseClient {
  async create(): Promise<User> {
    return (await this.http.post<User>('/users')).data
  }

  async get(id: string): Promise<User | undefined> {
    return handleNotFound(async () => {
      return (await this.http.get<User>(`/users/${id}`)).data
    }, undefined)
  }
}
