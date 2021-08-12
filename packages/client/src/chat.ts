import { Message } from '@botpress/messaging-base'
import { BaseClient } from './base'

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
