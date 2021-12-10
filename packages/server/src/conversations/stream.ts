import { Streamer } from '../base/streamer'
import { ConversationCreatedEvent, ConversationEvents } from './events'
import { ConversationService } from './service'

export class ConversationStream {
  constructor(private streamer: Streamer, private conversations: ConversationService) {}

  async setup() {
    this.conversations.events.on(ConversationEvents.Created, this.handleConversationCreated.bind(this))
  }

  private async handleConversationCreated({ conversation }: ConversationCreatedEvent) {
    await this.streamer.stream(
      'conversation.new',
      { conversationId: conversation.id },
      conversation.clientId,
      conversation.userId
    )
  }
}
