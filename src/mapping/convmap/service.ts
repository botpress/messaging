import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { ServerCache2D } from '../../caching/cache2D'
import { CachingService } from '../../caching/service'
import { DatabaseService } from '../../database/service'
import { ConvmapTable } from './table'
import { Convmap } from './types'

export class ConvmapService extends Service {
  private table: ConvmapTable
  private cacheByThreadId!: ServerCache2D<Convmap>
  private cacheByConversationId!: ServerCache2D<Convmap>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()

    this.table = new ConvmapTable()
  }

  async setup() {
    this.cacheByThreadId = await this.caching.newServerCache2D('cache_convmap_by_thread_id')
    this.cacheByConversationId = await this.caching.newServerCache2D('cache_convmap_by_conversation_id')

    await this.db.registerTable(this.table)
  }

  async create(tunnelId: uuid, conversationId: uuid, threadId: uuid): Promise<Convmap> {
    const convmap = {
      tunnelId,
      conversationId,
      threadId
    }

    await this.query().insert(convmap)
    this.cacheByThreadId.set(tunnelId, threadId, convmap)
    this.cacheByConversationId.set(tunnelId, conversationId, convmap)

    return convmap
  }

  async getByThreadId(tunnelId: uuid, threadId: uuid): Promise<Convmap | undefined> {
    const cached = this.cacheByThreadId.get(tunnelId, threadId)
    if (cached) {
      return cached
    }

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
