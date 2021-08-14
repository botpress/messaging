import { Message, uuid } from '@botpress/messaging-base'
import { MessagingSocket, SocketComEvents } from '@botpress/messaging-socket'
import { WebchatConversation } from '../conversation/system'
import { WebchatUser } from '../user/system'
import { MessagesEmitter, MessagesEvents, MessagesWatcher } from './events'

export class WebchatMessages {
  public readonly events: MessagesWatcher
  private readonly emitter: MessagesEmitter

  constructor(
    private clientId: uuid,
    private socket: MessagingSocket,
    private user: WebchatUser,
    private conversation: WebchatConversation
  ) {
    this.emitter = new MessagesEmitter()
    this.events = this.emitter
  }

  async setup() {
    await this.setupMessageReception()
    await this.setupInitialMessages()
  }

  private async setupMessageReception() {
    this.socket.com.events.on(SocketComEvents.Message, async (message) => {
      if (message.type === 'message') {
        void this.emitter.emit(MessagesEvents.Receive, [message.data])
      }
    })
  }

  private async setupInitialMessages() {
    const messages = await this.socket.com.request<Message[]>('messages.list', {
      clientId: this.clientId,
      userId: this.user.get()?.id,
      conversationId: this.conversation.get()!.id
    })
    await this.emitter.emit(MessagesEvents.Receive, messages.reverse())
  }

  public async send(text: string) {
    const payload = {
      type: 'text',
      text
    }
    await this.emitter.emit(MessagesEvents.Send, [payload])

    const message = await this.socket.com.request<Message>('messages.create', {
      clientId: this.clientId,
      userId: this.user.get()!.id,
      conversationId: this.conversation.get()!.id,
      payload
    })
    await this.emitter.emit(MessagesEvents.Receive, [message])
  }
}
