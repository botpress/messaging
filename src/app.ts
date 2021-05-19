import { Router } from 'express'
import { ChannelService } from './channels/service'
import { ConfigService } from './config/service'
import { ConversationService } from './conversations/service'
import { DatabaseService } from './database/service'
import { KvsService } from './kvs/service'
import { MessageService } from './messages/service'

export class App {
  config: ConfigService
  database: DatabaseService
  kvs: KvsService
  conversations: ConversationService
  messages: MessageService
  channels: ChannelService

  constructor(private router: Router) {
    this.config = new ConfigService()
    this.database = new DatabaseService(this.config)
    this.kvs = new KvsService(this.database)
    this.conversations = new ConversationService(this.database)
    this.messages = new MessageService(this.database, this.conversations)
    this.channels = new ChannelService(this.config, this.kvs, this.conversations, this.messages, this.router)
  }

  async setup() {
    await this.config.setup()
    await this.database.setup()
    await this.kvs.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()
  }
}
