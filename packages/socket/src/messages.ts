import { Message } from '@botpress/messaging-base'
import { BaseSocket } from './base'

export class MessageSocket extends BaseSocket {
  async create(conversationId: string, payload: any): Promise<Message> {
    return this.request('messages.create', {
      conversationId,
      payload
    })
  }

  async list(conversationId: string, limit: number): Promise<Message[]> {
    return this.request('messages.list', {
      conversationId,
      limit
    })
  }
}
