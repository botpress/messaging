import { uuid } from '@botpress/messaging-base'
import {
  Barrier2D,
  BarrierService,
  Batcher,
  BatchingService,
  CachingService,
  DatabaseService,
  ServerCache,
  ServerCache2D,
  Service
} from '@botpress/messaging-engine'
import { ConversationService } from '../../conversations/service'
import { ThreadService } from '../threads/service'
import { TunnelService } from '../tunnels/service'
import { ConvmapTable } from './table'
import { Convmap } from './types'

export class ConvmapService extends Service {
  public batcher!: Batcher<Convmap>

  private table: ConvmapTable
  private cacheByThreadId!: ServerCache2D<Convmap>
  private cacheByConversationId!: ServerCache<uuid, Convmap[]>
  private barrier!: Barrier2D<Convmap>

  constructor(
    private db: DatabaseService,
    private caching: CachingService,
    private batching: BatchingService,
    private barriers: BarrierService,
    private conversations: ConversationService,
    private tunnels: TunnelService,
    private threads: ThreadService
  ) {
    super()

    this.table = new ConvmapTable()
  }

  async setup() {
    this.cacheByThreadId = await this.caching.newServerCache2D('cache_convmap_by_thread_id')
    this.cacheByConversationId = await this.caching.newServerCache('cache_convmap_by_conversation_id')
    this.barrier = await this.barriers.newBarrier2D('barrier_convmap')

    this.batcher = await this.batching.newBatcher(
      'batcher_convmap',
      [this.conversations.batcher, this.threads.batcher],
      this.handleBatchFlush.bind(this)
    )

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: Convmap[]) {
    await this.query().insert(batch)
  }

  async create(tunnelId: uuid, conversationId: uuid, threadId: uuid): Promise<Convmap> {
    const convmap = {
      tunnelId,
      conversationId,
      threadId
    }

    await this.batcher.push(convmap)
    this.cacheByThreadId.set(tunnelId, threadId, convmap)
    // FIXME: What to do with this? This could lead to errors if we have a single
    // conversation linked to more than one channel (we don't do that currently so it's fine for now)
    this.cacheByConversationId.set(conversationId, [convmap])

    return convmap
  }

  async getByThreadId(tunnelId: uuid, threadId: uuid): Promise<Convmap | undefined> {
    const cached = this.cacheByThreadId.get(tunnelId, threadId)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ tunnelId, threadId })

    if (rows?.length) {
      const convmap = rows[0] as Convmap
      this.cacheByThreadId.set(tunnelId, threadId, convmap)
      return convmap
    } else {
      return undefined
    }
  }

  async listByConversationId(conversationId: uuid): Promise<Convmap[]> {
    const cached = this.cacheByConversationId.get(conversationId)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ conversationId })

    const convmaps = (rows || []) as Convmap[]
    this.cacheByConversationId.set(conversationId, convmaps)
    return convmaps
  }

  async map(tunnelId: uuid, threadId: uuid, userId: uuid): Promise<Convmap> {
    const convmap = await this.getByThreadId(tunnelId, threadId)
    if (convmap) {
      return convmap
    }

    return this.barrier.once(tunnelId, threadId, async () => {
      const tunnel = await this.tunnels.get(tunnelId)
      const conversation = await this.conversations.create(tunnel!.clientId, userId)
      return this.create(tunnelId, conversation.id, threadId)
    })
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
