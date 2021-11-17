import { uuid } from '@botpress/messaging-base'
import { Service } from '@botpress/messaging-engine'
import { Batcher } from '../../batching/batcher'
import { BatchingService } from '../../batching/service'
import { ServerCache2D } from '../../caching/cache2D'
import { CachingService } from '../../caching/service'
import { DatabaseService } from '../../database/service'
import { UserService } from '../../users/service'
import { SenderService } from '../senders/service'
import { UsermapTable } from './table'
import { Usermap } from './types'

export class UsermapService extends Service {
  private table: UsermapTable
  private cacheBySenderId!: ServerCache2D<Usermap>
  private batcher!: Batcher<Usermap>

  constructor(
    private db: DatabaseService,
    private caching: CachingService,
    private batching: BatchingService,
    private users: UserService,
    private senders: SenderService
  ) {
    super()

    this.table = new UsermapTable()
  }

  async setup() {
    this.cacheBySenderId = await this.caching.newServerCache2D('cache_usermap_by_sender_id')

    this.batcher = await this.batching.newBatcher(
      'batcher_usermap',
      [this.users.batcher, this.senders.batcher],
      this.handleBatchFlush.bind(this)
    )

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: Usermap[]) {
    await this.query().insert(batch)
  }

  async create(tunnelId: uuid, userId: uuid, senderId: uuid): Promise<Usermap> {
    const usermap = {
      tunnelId,
      userId,
      senderId
    }

    await this.batcher.push(usermap)
    this.cacheBySenderId.set(tunnelId, senderId, usermap)

    return usermap
  }

  async getBySenderId(tunnelId: uuid, senderId: uuid): Promise<Usermap | undefined> {
    const cached = this.cacheBySenderId.get(tunnelId, senderId)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ tunnelId, senderId })

    if (rows?.length) {
      const convmap = rows[0] as Usermap
      this.cacheBySenderId.set(tunnelId, senderId, convmap)
      return convmap
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
