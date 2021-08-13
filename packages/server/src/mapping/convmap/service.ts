import { uuid } from '@botpress/messaging-base'
import { Service } from '../../base/service'
import { Batcher } from '../../batching/batcher'
import { BatchingService } from '../../batching/service'
import { ServerCache2D } from '../../caching/cache2D'
import { CachingService } from '../../caching/service'
import { ConversationService } from '../../conversations/service'
import { DatabaseService } from '../../database/service'
import { ThreadService } from '../threads/service'
import { ConvmapTable } from './table'
import { Convmap } from './types'

export class ConvmapService extends Service {
  public batcher!: Batcher<Convmap>

  private table: ConvmapTable
  private cacheByThreadId!: ServerCache2D<Convmap>
  private cacheByConversationId!: ServerCache2D<Convmap>

  constructor(
    private db: DatabaseService,
    private caching: CachingService,
    private batching: BatchingService,
    private conversations: ConversationService,
    private threads: ThreadService
  ) {
    super()

    this.table = new ConvmapTable()
  }

  async setup() {
    this.cacheByThreadId = await this.caching.newServerCache2D('cache_convmap_by_thread_id')
    this.cacheByConversationId = await this.caching.newServerCache2D('cache_convmap_by_conversation_id')

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
    this.cacheByConversationId.set(tunnelId, conversationId, convmap)

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

  async getByConversationId(tunnelId: uuid, conversationId: uuid): Promise<Convmap | undefined> {
    const cached = this.cacheByConversationId.get(tunnelId, conversationId)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ tunnelId, conversationId })

    if (rows?.length) {
      const convmap = rows[0] as Convmap
      this.cacheByConversationId.set(tunnelId, conversationId, convmap)
      return convmap
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
