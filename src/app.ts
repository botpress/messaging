import { Router } from 'express'
import _ from 'lodash'
import { ChannelService } from './channels/service'
import { ClientService } from './clients/service'
import { ConfigService } from './config/service'
import { ConversationService } from './conversations/service'
import { DatabaseService } from './database/service'
import { KvsService } from './kvs/service'
import { LoggerService } from './logger/service'
import { MappingService } from './mapping/service'
import { MessageService } from './messages/service'
import { ProviderService } from './providers/service'

export class App {
  logger: LoggerService
  config: ConfigService
  database: DatabaseService
  kvs: KvsService
  providers: ProviderService
  clients: ClientService
  conversations: ConversationService
  messages: MessageService
  mapping: MappingService
  channels: ChannelService

  constructor(private router: Router) {
    this.logger = new LoggerService()
    this.config = new ConfigService()
    this.database = new DatabaseService(this.config)
    this.kvs = new KvsService(this.database)
    this.providers = new ProviderService(this.database, this.config)
    this.clients = new ClientService(this.database, this.config, this.providers)
    this.conversations = new ConversationService(this.database)
    this.messages = new MessageService(this.database, this.conversations)
    this.mapping = new MappingService(this.database)
    this.channels = new ChannelService(
      this.database,
      this.config,
      this.providers,
      this.kvs,
      this.conversations,
      this.messages,
      this.mapping,
      this.logger,
      this.router
    )
  }

  async setup() {
    await this.logger.setup()
    await this.config.setup()
    await this.database.setup()
    await this.kvs.setup()
    await this.providers.setup()
    await this.clients.setup()
    await this.conversations.setup()
    await this.messages.setup()

    // TODO: We need to setup channels before to have the channels table
    await this.channels.setup()
    await this.mapping.setup()
  }
}
