import { App } from './app'
import { Streamer } from './base/streamer'
import { ConversationStream } from './conversations/stream'
import { HealthStream } from './health/stream'
import { MessageStream } from './messages/stream'
import { UserStream } from './users/stream'

export class Stream {
  private streamer: Streamer

  private health: HealthStream
  private users: UserStream
  private conversations: ConversationStream
  private messages: MessageStream

  constructor(app: App) {
    this.streamer = new Streamer(app.dispatches, app.sockets, app.webhooks)
    this.health = new HealthStream(this.streamer, app.channels, app.provisions, app.conduits, app.health)
    this.users = new UserStream(this.streamer, app.users)
    this.conversations = new ConversationStream(this.streamer, app.channels, app.conversations, app.mapping)
    this.messages = new MessageStream(
      this.streamer,
      app.channels,
      app.conversations,
      app.messages,
      app.converse,
      app.mapping
    )
  }

  async setup() {
    await this.streamer.setup()
    await this.health.setup()
    await this.users.setup()
    await this.conversations.setup()
    await this.messages.setup()
  }

  async destroy() {
    await this.streamer.destroy()
  }
}
