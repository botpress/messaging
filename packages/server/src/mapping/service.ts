import { uuid } from '@botpress/messaging-base'
import { BatchingService, CachingService, DatabaseService, Service } from '@botpress/messaging-engine'
import { ConversationService } from '../conversations/service'
import { UserService } from '../users/service'
import { ConvmapService } from './convmap/service'
import { IdentityService } from './identities/service'
import { SandboxmapService } from './sandboxmap/service'
import { SenderService } from './senders/service'
import { ThreadService } from './threads/service'
import { TunnelService } from './tunnels/service'
import { Endpoint, Mapping } from './types'
import { UsermapService } from './usermap/service'

export class MappingService extends Service {
  public tunnels: TunnelService
  public identities: IdentityService
  public senders: SenderService
  public threads: ThreadService
  public usermap: UsermapService
  public convmap: ConvmapService
  public sandboxmap: SandboxmapService

  constructor(
    private db: DatabaseService,
    private caching: CachingService,
    private batching: BatchingService,
    private users: UserService,
    private conversations: ConversationService
  ) {
    super()

    this.tunnels = new TunnelService(this.db, this.caching)
    this.identities = new IdentityService(this.db, this.caching)
    this.senders = new SenderService(this.db, this.caching, this.batching)
    this.threads = new ThreadService(this.db, this.caching, this.batching, this.senders)
    this.usermap = new UsermapService(this.db, this.caching, this.batching, this.users, this.tunnels, this.senders)
    this.convmap = new ConvmapService(
      this.db,
      this.caching,
      this.batching,
      this.conversations,
      this.tunnels,
      this.threads
    )
    this.sandboxmap = new SandboxmapService(this.db, this.caching)
  }

  async setup() {
    await this.tunnels.setup()
    await this.identities.setup()
    await this.senders.setup()
    await this.threads.setup()
    await this.usermap.setup()
    await this.convmap.setup()
    await this.sandboxmap.setup()
  }

  async getMapping(clientId: uuid, channelId: uuid, endpoint: Endpoint): Promise<Mapping> {
    const tunnel = await this.tunnels.map(clientId, channelId)
    const identity = await this.identities.map(tunnel.id, endpoint.identity || '*')
    const sender = await this.senders.map(identity.id, endpoint.sender || '*')
    const thread = await this.threads.map(sender.id, endpoint.thread || '*')
    const usermap = await this.usermap.map(tunnel.id, sender.id)
    const convmap = await this.convmap.map(tunnel.id, thread.id, usermap.userId)

    return {
      tunnelId: tunnel.id,
      identityId: identity.id,
      senderId: sender.id,
      threadId: thread.id,
      userId: usermap.userId,
      conversationId: convmap.conversationId
    }
  }

  async getEndpoint(threadId: uuid): Promise<Endpoint> {
    const thread = await this.threads.get(threadId)
    const sender = await this.senders.get(thread!.senderId)
    const identity = await this.identities.get(sender!.identityId)

    return {
      identity: identity?.name,
      sender: sender?.name,
      thread: thread?.name
    }
  }
}
