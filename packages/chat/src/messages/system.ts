import { MessagingSocket, SocketComEvents } from '@botpress/messaging-socket'
import { WebchatSystem } from '../base/system'
import { WebchatConversation } from '../conversation/system'
import { MessagesEmitter, MessagesEvents, MessagesWatcher } from './events'

export class WebchatMessages extends WebchatSystem {
  public readonly events: MessagesWatcher
  private readonly emitter: MessagesEmitter

  constructor(private socket: MessagingSocket, private conversation: WebchatConversation) {
    super()
    this.emitter = new MessagesEmitter()
    this.events = this.emitter
  }

  async setup() {
    await this.setupMessageReception()
    await this.setupInitialMessages()
  }

  private async setupMessageReception() {
    this.socket.com.events.on(SocketComEvents.Message, async (message) => {
      if (message.type === 'message.new') {
        await this.emitter.emit(MessagesEvents.Receive, [message.data.data.message])
      }
    })
  }

  private async setupInitialMessages() {
    const messages = await this.socket.messages.list(this.conversation.get()!.id, 20)
    await this.emitter.emit(MessagesEvents.Receive, messages.reverse())
  }

  public async send(text: string) {
    const payload = {
      type: 'text',
      text
    }
    await this.emitter.emit(MessagesEvents.Send, [payload])

    const message = await this.socket.messages.create(this.conversation.get()!.id, payload)
    await this.emitter.emit(MessagesEvents.Receive, [message])
    return message
  }
}
