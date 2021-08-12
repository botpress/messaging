import { BaseClient } from './base'
import { Message } from './messages'

export class ChatClient extends BaseClient {
  async reply(conversationId: string, channel: string, payload: any): Promise<Message> {
    return this.deserialize((await this.http.post('/chat/reply', { conversationId, channel, payload })).data)
  }

  private deserialize(message: any) {
    return {
      ...message,
      sentOn: new Date(message.sentOn)
    }
  }
}
