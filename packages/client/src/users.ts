import { User } from '@botpress/messaging-base'
import axios from 'axios'
import { BaseClient } from './base'

export class UserClient extends BaseClient {
  async create(): Promise<User> {
    return (await this.http.post<User>('/users')).data
  }

  async get(id: string): Promise<User | undefined> {
    try {
      return (await this.http.get<User>(`/users/${id}`)).data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return undefined
      }

      throw err
    }
  }
}
