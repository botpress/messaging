import { Conversation } from '@botpress/messaging-client'
import { ConversationEmitter, ConversationEvents, ConversationWatcher } from './events'

export class WebchatConversation {
  public readonly events: ConversationWatcher
  public current?: Conversation

  private emitter: ConversationEmitter

  constructor() {
    this.emitter = new ConversationEmitter()
    this.events = this.emitter
  }

  public async set(value: Conversation) {
    const previous = this.current
    this.current = value
    await this.emitter.emit(ConversationEvents.Set, { previous, value })
  }
}
