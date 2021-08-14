import { Conversation, uuid } from '@botpress/messaging-client'
import { WebchatSocket } from '../socket/system'
import { WebchatStorage } from '../storage/system'
import { WebchatUser } from '../user/system'
import { ConversationEmitter, ConversationEvents, ConversationWatcher } from './events'

export class WebchatConversation {
  public readonly events: ConversationWatcher
  public current?: Conversation

  private emitter: ConversationEmitter

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
    let conversation = this.storage.get<Conversation>('saved-conversation')

    conversation = await this.socket.request<Conversation>('conversations.use', {
      clientId: this.clientId,
      userId: this.user.current?.id,
      conversationId: conversation?.id
    })

    this.storage.set('saved-conversation', conversation)
    await this.set(conversation!)
  }

  async set(value: Conversation) {
    const previous = this.current
    this.current = value
    await this.emitter.emit(ConversationEvents.Set, { previous, value })
  }
}
