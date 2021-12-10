import { Engine } from '@botpress/messaging-engine'
import { ChannelService } from './channels/service'
import { ClientService } from './clients/service'
import { ConduitService } from './conduits/service'
import { ConversationService } from './conversations/service'
import { ConverseService } from './converse/service'
import { HealthService } from './health/service'
import { InstanceService } from './instances/service'
import { MappingService } from './mapping/service'
import { MessageService } from './messages/service'
import { Migrations } from './migrations'
import { ProviderService } from './providers/service'
import { SocketService } from './socket/service'
import { StatusService } from './status/service'
import { SyncService } from './sync/service'
import { UserTokenService } from './user-tokens/service'
import { UserService } from './users/service'
import { WebhookService } from './webhooks/service'

export class App extends Engine {
  channels: ChannelService
  providers: ProviderService
  clients: ClientService
  webhooks: WebhookService
  conduits: ConduitService
  users: UserService
  userTokens: UserTokenService
  conversations: ConversationService
  messages: MessageService
  converse: ConverseService
  mapping: MappingService
  status: StatusService
  instances: InstanceService
  syncs: SyncService
  health: HealthService
  sockets: SocketService

  constructor() {
    super()
    this.channels = new ChannelService(this.database)
    this.providers = new ProviderService(this.database, this.caching)
    this.clients = new ClientService(this.database, this.crypto, this.caching, this.providers)
    this.webhooks = new WebhookService(this.database, this.caching, this.crypto)
    this.conduits = new ConduitService(this.database, this.crypto, this.caching, this.channels, this.providers)
    this.users = new UserService(this.database, this.caching, this.batching)
    this.userTokens = new UserTokenService(this.database, this.crypto, this.caching, this.batching, this.users)
    this.conversations = new ConversationService(this.database, this.caching, this.batching, this.users)
    this.messages = new MessageService(this.database, this.caching, this.batching, this.conversations)
    this.converse = new ConverseService(this.caching, this.dispatches, this.messages)
    this.mapping = new MappingService(
      this.database,
      this.caching,
      this.batching,
      this.barriers,
      this.users,
      this.conversations
    )
    this.status = new StatusService(this.database, this.distributed, this.caching, this.conduits)
    this.instances = new InstanceService(
      this.logger,
      this.distributed,
      this.dispatches,
      this.caching,
      this.channels,
      this.providers,
      this.conduits,
      this.conversations,
      this.messages,
      this.clients,
      this.mapping,
      this.status
    )
    this.syncs = new SyncService(
      this.logger,
      this.distributed,
      this.channels,
      this.providers,
      this.conduits,
      this.clients,
      this.webhooks
    )
    this.health = new HealthService(
      this.database,
      this.caching,
      this.channels,
      this.clients,
      this.conduits,
      this.instances
    )
    this.sockets = new SocketService(this.caching, this.users)
  }

  async setup() {
    this.meta.setupPkg(require('../package.json'))
    this.migration.setupMigrations(Migrations)
    await super.setup()

    await this.channels.setup()
    await this.providers.setup()
    await this.clients.setup()
    await this.webhooks.setup()
    await this.conduits.setup()
    await this.users.setup()
    await this.userTokens.setup()
    await this.conversations.setup()
    await this.messages.setup()
    await this.converse.setup()
    await this.mapping.setup()
    await this.status.setup()
    await this.instances.setup()
    await this.health.setup()
    await this.sockets.setup()
  }

  async monitor() {
    await this.syncs.setup()
    await this.instances.monitor()
  }

  async destroy() {
    await this.batching?.destroy()
    await this.instances?.destroy()
    await this.distributed?.destroy()
    await this.database?.destroy()
  }
}
