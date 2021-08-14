import { Conversation, uuid } from '@botpress/messaging-base'
import { BaseSocket } from './base'

export class ConversationSocket extends BaseSocket {
  public async use(conversationId: uuid | undefined): Promise<Conversation> {
    return this.request('conversations.use', {
      conversationId
    })
  }
}
