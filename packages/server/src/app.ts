import { BatchingService } from './batching/service'
import { CachingService } from './caching/service'
import { ChannelService } from './channels/service'
import { ClientService } from './clients/service'
import { ConduitService } from './conduits/service'
import { ConversationService } from './conversations/service'
import { ConverseService } from './converse/service'
import { CryptoService } from './crypto/service'
import { DatabaseService } from './database/service'
import { DistributedService } from './distributed/service'
import { HealthService } from './health/service'
import { InstanceService } from './instances/service'
import { KvsService } from './kvs/service'
import { LoggerService } from './logger/service'
import { MappingService } from './mapping/service'
import { MessageService } from './messages/service'
import { MetaService } from './meta/service'
import { MigrationService } from './migration/service'
import { PostService } from './post/service'
import { ProviderService } from './providers/service'
import { SocketService } from './socket/service'
import { StatusService } from './status/service'
import { StreamService } from './stream/service'
import { SyncService } from './sync/service'
import { UserTokenService } from './user-tokens/service'
import { UserService } from './users/service'
import { WebhookService } from './webhooks/service'

export class App {
  logger: LoggerService
  database: DatabaseService
  meta: MetaService
  migration: MigrationService
  crypto: CryptoService
  distributed: DistributedService
  caching: CachingService
  batching: BatchingService
  post: PostService
  channels: ChannelService
  providers: ProviderService
  clients: ClientService
  webhooks: WebhookService
  kvs: KvsService
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
  stream: StreamService

  constructor() {
    this.logger = new LoggerService()
    this.database = new DatabaseService()
    this.meta = new MetaService(this.database)
    this.migration = new MigrationService(this.database, this.meta)
    this.crypto = new CryptoService()
    this.distributed = new DistributedService()
    this.caching = new CachingService(this.distributed)
    this.batching = new BatchingService()
    this.post = new PostService()
    this.channels = new ChannelService(this.database)
    this.providers = new ProviderService(this.database, this.caching)
    this.clients = new ClientService(this.database, this.crypto, this.caching, this.providers)
    this.webhooks = new WebhookService(this.database, this.caching, this.crypto)
    this.kvs = new KvsService(this.database, this.caching)
    this.conduits = new ConduitService(this.database, this.crypto, this.caching, this.channels, this.providers)
    this.users = new UserService(this.database, this.caching, this.batching)
    this.userTokens = new UserTokenService(this.database, this.crypto, this.caching, this.batching, this.users)
    this.conversations = new ConversationService(this.database, this.caching, this.batching, this.users)
    this.messages = new MessageService(this.database, this.caching, this.batching, this.conversations)
    this.converse = new ConverseService(this.caching, this.distributed, this.messages)
    this.mapping = new MappingService(this.database, this.caching, this.batching, this.users, this.conversations)
    this.status = new StatusService(this.database, this.distributed, this.caching, this.conduits)
    this.instances = new InstanceService(
      this.logger,
      this.distributed,
      this.caching,
      this.channels,
      this.providers,
      this.conduits,
      this.conversations,
      this.messages,
      this.clients,
      this.mapping,
      this.status,
      this
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
    this.stream = new StreamService(
      this.distributed,
      this.post,
      this.sockets,
      this.channels,
      this.clients,
      this.webhooks,
      this.conduits,
      this.health,
      this.users,
      this.conversations,
      this.messages,
      this.converse,
      this.mapping
    )
  }

  async setup() {
    await this.logger.setup()
    await this.database.setup()
    await this.meta.setup()
    await this.migration.setup()
    await this.crypto.setup()
    await this.distributed.setup()
    await this.caching.setup()
    await this.batching.setup()
    await this.post.setup()
    await this.channels.setup()
    await this.providers.setup()
    await this.clients.setup()
    await this.webhooks.setup()
    await this.kvs.setup()
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
    await this.stream.setup()
  }

  async monitor() {
    await this.syncs.setup()
    await this.instances.monitor()
  }

  async destroy() {
    await this.post?.destroy()
    await this.batching?.destroy()
    await this.instances?.destroy()
    await this.distributed?.destroy()
    await this.database?.destroy()
  }
}
