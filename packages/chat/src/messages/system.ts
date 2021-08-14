import { Message, uuid } from '@botpress/messaging-client'
import { WebchatConversation } from '../conversation/system'
import { SocketEvents } from '../socket/events'
import { WebchatSocket } from '../socket/system'
import { WebchatUser } from '../user/system'
import { MessagesEmitter, MessagesEvents, MessagesWatcher } from './events'

export class WebchatMessages {
  public readonly events: MessagesWatcher

  private emitter: MessagesEmitter

  constructor(
    private clientId: uuid,
    private socket: WebchatSocket,
    private user: WebchatUser,
    private conversation: WebchatConversation
  ) {
    this.emitter = new MessagesEmitter()
    this.events = this.emitter
  }

  async setup() {
    this.socket.events.on(SocketEvents.Message, async (message) => {
      if (message.type === 'message') {
        void this.emitter.emit(MessagesEvents.Receive, [message.data])
      }
    })

    const messages = await this.socket.request<Message[]>('messages.list', {
      clientId: this.clientId,
      userId: this.user.current?.id,
      conversationId: this.conversation.current?.id
    })

    await this.emitter.emit(MessagesEvents.Receive, messages.reverse())
  }

  public async send(text: string) {
    const payload = {
      type: 'text',
      text
    }

    await this.emitter.emit(MessagesEvents.Send, [payload])

    const message = await this.socket.request<Message>('messages.create', {
      clientId: this.clientId,
      userId: this.user.current?.id,
      conversationId: this.conversation.current?.id,
      payload
    })

    await this.emitter.emit(MessagesEvents.Receive, [message])
  }
}
