import { StreamService } from '../stream/service'
import { ConversationCreatedEvent, ConversationEvents } from './events'
import { ConversationService } from './service'

export class ConversationStream {
  constructor(private conversations: ConversationService, private stream: StreamService) {}

  async setup() {
    this.conversations.events.on(ConversationEvents.Created, this.handleConversationCreated.bind(this))
  }

  private async handleConversationCreated({ conversation }: ConversationCreatedEvent) {
    await this.stream.stream(
      'conversation.new',
      { conversationId: conversation.id },
      conversation.clientId,
      conversation.userId
    )
  }
}
