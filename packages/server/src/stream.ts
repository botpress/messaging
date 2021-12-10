import { App } from './app'
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
    this.health = new HealthStream(app.channels, app.clients, app.conduits, app.health, app.stream)
    this.users = new UserStream(app.users, app.stream)
    this.conversations = new ConversationStream(app.conversations, app.stream)
    this.messages = new MessageStream(
      app.channels,
      app.conversations,
      app.messages,
      app.converse,
      app.mapping,
      app.stream
    )
  }

  async setup() {
    await this.health.setup()
    await this.users.setup()
    await this.conversations.setup()
    await this.messages.setup()
  }
}
