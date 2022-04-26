import { uuid } from '@botpress/messaging-base'
import {
  Barrier2D,
  BarrierService,
  Batcher,
  BatchingService,
  CachingService,
  DatabaseService,
  ServerCache2D,
  Service
} from '@botpress/messaging-engine'
import { UserService } from '../../users/service'
import { SenderService } from '../senders/service'
import { TunnelService } from '../tunnels/service'
import { UsermapTable } from './table'
import { Usermap } from './types'

export class UsermapService extends Service {
  private table: UsermapTable
  private cacheBySenderId!: ServerCache2D<Usermap>
  private barrier!: Barrier2D<Usermap>
  private batcher!: Batcher<Usermap>

  constructor(
    private db: DatabaseService,
    private caching: CachingService,
    private batching: BatchingService,
    private barriers: BarrierService,
    private users: UserService,
    private tunnels: TunnelService,
    private senders: SenderService
  ) {
    super()

    this.table = new UsermapTable()
  }

  async setup() {
    this.cacheBySenderId = await this.caching.newServerCache2D('cache_usermap_by_sender_id')
    this.barrier = await this.barriers.newBarrier2D('barrier_usermap')

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

  async map(tunnelId: uuid, senderId: uuid): Promise<Usermap> {
    const usermap = await this.getBySenderId(tunnelId, senderId)
    if (usermap) {
      return usermap
    }

    return this.barrier.once(tunnelId, senderId, async () => {
      const tunnel = await this.tunnels.get(tunnelId)
      const user = await this.users.create(tunnel!.clientId)
      return this.create(tunnelId, user.id, senderId)
    })
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
