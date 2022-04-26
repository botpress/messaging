import { Conversation, uuid } from '@botpress/messaging-base'
import { MessagingSocket } from '@botpress/messaging-socket'
import { WebchatSystem } from '../base/system'
import { WebchatStorage } from '../storage/system'
import { ConversationEmitter, ConversationEvents, ConversationWatcher } from './events'

export class WebchatConversation extends WebchatSystem {
  public readonly events: ConversationWatcher
  private readonly emitter: ConversationEmitter
  private current?: Conversation

  constructor(private storage: WebchatStorage, private socket: MessagingSocket) {
    super()
    this.emitter = new ConversationEmitter()
    this.events = this.emitter
  }

  async setup() {
    const STORAGE_ID = 'saved-conversation'
    const saved = this.storage.get<uuid>(STORAGE_ID)

    const event = { choice: saved }
    await this.emitter.emit(ConversationEvents.Choose, event)

    let conversation = event.choice && (await this.socket.getConversation(event.choice))
    if (!conversation) {
      conversation = await this.socket.createConversation()
    } else {
      await this.socket.switchConversation(conversation.id)
    }

    this.storage.set(STORAGE_ID, conversation.id)

    await this.set(conversation)
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
