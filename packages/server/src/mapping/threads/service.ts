import { uuid } from '@botpress/messaging-base'
import {
  Batcher,
  BatchingService,
  CachingService,
  DatabaseService,
  ServerCache,
  ServerCache2D,
  Service
} from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { SenderService } from '../senders/service'
import { ThreadTable } from './table'
import { Thread } from './types'

export class ThreadService extends Service {
  public batcher!: Batcher<Thread>

  private table: ThreadTable
  private cacheById!: ServerCache<uuid, Thread>
  private cacheByName!: ServerCache2D<Thread>
  private locks!: ServerCache2D<Promise<Thread>>

  constructor(
    private db: DatabaseService,
    private caching: CachingService,
    private batching: BatchingService,
    private senders: SenderService
  ) {
    super()
    this.table = new ThreadTable()
  }

  async setup() {
    this.cacheById = await this.caching.newServerCache('cache_thread_by_id')
    this.cacheByName = await this.caching.newServerCache2D('cache_thread_by_name')
    this.locks = await this.caching.newServerCache2D('cache_thread_locks')

    this.batcher = await this.batching.newBatcher(
      'batcher_thread',
      [this.senders.batcher],
      this.handleBatchFlush.bind(this)
    )

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: Thread[]) {
    await this.query().insert(batch)
  }

  async get(id: uuid): Promise<Thread | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ id })

    if (rows?.length) {
      const thread = rows[0] as Thread
      this.cacheById.set(id, thread)
      return thread
    } else {
      return undefined
    }
  }

  async map(senderId: uuid, name: string): Promise<Thread> {
    const cached = this.cacheByName.get(senderId, name)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ senderId, name })

    if (rows?.length) {
      const thread = rows[0] as Thread
      this.cacheByName.set(senderId, name, thread)
      return thread
    } else {
      let promise = this.locks.get(senderId, name)

      if (!promise) {
        promise = new Promise(async (resolve) => {
          const thread = {
            id: uuidv4(),
            senderId,
            name
          }

          await this.batcher.push(thread)
          this.cacheByName.set(senderId, name, thread)
          this.cacheById.set(thread.id, thread)

          resolve(thread)
          this.locks.del(senderId, name)
        })

        this.locks.set(senderId, name, promise)
      }

      return promise
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
