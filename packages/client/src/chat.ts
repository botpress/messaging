import { BaseClient } from './base'
import { Message } from './messages'

export class ChatClient extends BaseClient {
  async reply(conversationId: string, channel: string, payload: any): Promise<Message> {
    return (await this.http.post('/chat/reply', { conversationId, channel, payload })).data
  }
}
