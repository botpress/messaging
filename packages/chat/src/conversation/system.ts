import { Conversation, uuid } from '@botpress/messaging-base'
import { WebchatSocket } from '../socket/system'
import { WebchatStorage } from '../storage/system'
import { WebchatUser } from '../user/system'
import { ConversationEmitter, ConversationEvents, ConversationWatcher } from './events'

export class WebchatConversation {
  public readonly events: ConversationWatcher
  private readonly emitter: ConversationEmitter
  private current?: Conversation

  constructor(
    private clientId: uuid,
    private storage: WebchatStorage,
    private socket: WebchatSocket,
    private user: WebchatUser
  ) {
    this.emitter = new ConversationEmitter()
    this.events = this.emitter
  }

  async setup() {
    const saved = this.storage.get<Conversation>('saved-conversation')
    const conversation = await this.socket.request<Conversation>('conversations.use', {
      clientId: this.clientId,
      userId: this.user.get()!.id,
      conversationId: saved?.id
    })
    this.storage.set('saved-conversation', conversation)

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
