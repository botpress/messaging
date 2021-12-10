import { App } from './app'
import { Streamer } from './base/streamer'
import { ConversationStream } from './conversations/stream'
import { HealthStream } from './health/stream'
import { MessageStream } from './messages/stream'
import { UserStream } from './users/stream'

export class Stream {
  private health: HealthStream
  private users: UserStream
  private conversations: ConversationStream
  private messages: MessageStream

  constructor(app: App) {
    const streamer = new Streamer(app.dispatches, app.post, app.sockets, app.webhooks)
    this.health = new HealthStream(streamer, app.channels, app.clients, app.conduits, app.health)
    this.users = new UserStream(streamer, app.users)
    this.conversations = new ConversationStream(streamer, app.conversations)
    this.messages = new MessageStream(
      streamer,
      app.channels,
      app.conversations,
      app.messages,
      app.converse,
      app.mapping
    )
  }

  async setup() {
    await this.health.setup()
    await this.users.setup()
    await this.conversations.setup()
    await this.messages.setup()
  }
}
