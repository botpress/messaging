import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { ServerCache2D } from '../../caching/cache2D'
import { CachingService } from '../../caching/service'
import { DatabaseService } from '../../database/service'
import { UsermapTable } from './table'
import { Usermap } from './types'

export class UsermapService extends Service {
  private table: UsermapTable
  private cacheBySenderId!: ServerCache2D<Usermap>
  private cacheByUserId!: ServerCache2D<Usermap>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()

    this.table = new UsermapTable()
  }

  async setup() {
    this.cacheBySenderId = await this.caching.newServerCache2D('cache_usermap_by_sender_id')
    this.cacheByUserId = await this.caching.newServerCache2D('cache_usermap_by_user_id')

    await this.db.registerTable(this.table)
  }

  async create(tunnelId: uuid, userId: uuid, senderId: uuid): Promise<Usermap> {
    const usermap = {
      tunnelId,
      userId,
      senderId
    }

    await this.query().insert(usermap)
    this.cacheBySenderId.set(tunnelId, senderId, usermap)
    this.cacheByUserId.set(tunnelId, userId, usermap)

    return usermap
  }

  async getBySenderId(tunnelId: uuid, senderId: uuid): Promise<Usermap | undefined> {
    const cached = this.cacheBySenderId.get(tunnelId, senderId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ tunnelId, senderId })

    if (rows?.length) {
      const convmap = rows[0] as Usermap
      this.cacheBySenderId.set(tunnelId, senderId, convmap)
      return convmap
    } else {
      return undefined
    }
  }

  async getByUserId(tunnelId: uuid, userId: uuid): Promise<Usermap | undefined> {
    const cached = this.cacheByUserId.get(tunnelId, userId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ tunnelId, userId })

    if (rows?.length) {
      const convmap = rows[0] as Usermap
      this.cacheByUserId.set(tunnelId, userId, convmap)
      return convmap
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
