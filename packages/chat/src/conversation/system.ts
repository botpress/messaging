import { Conversation, uuid } from '@botpress/messaging-base'
import { MessagingSocket } from '@botpress/messaging-socket'
import { WebchatStorage } from '../storage/system'
import { ConversationEmitter, ConversationEvents, ConversationWatcher } from './events'

export class WebchatConversation {
  public readonly events: ConversationWatcher
  private readonly emitter: ConversationEmitter
  private current?: Conversation

  constructor(private storage: WebchatStorage, private socket: MessagingSocket) {
    this.emitter = new ConversationEmitter()
    this.events = this.emitter
  }

  async setup() {
    const saved = this.storage.get<uuid>('saved-conversation')

    const event = { choice: saved }
    await this.emitter.emit(ConversationEvents.Choose, event)

    const conversation = await this.socket.conversations.use(event.choice)
    this.storage.set('saved-conversation', conversation.id)

    await this.set(conversation!)
  }

  get() {
    return this.current
  }

  async set(value: Conversation) {
    const previous = this.current
    this.current = value
    await this.emitter.emit(ConversationEvents.Set, { previous, value })
  }
}
