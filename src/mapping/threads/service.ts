import { v4 as uuidv4 } from 'uuid'
import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { ServerCache } from '../../caching/cache'
import { ServerCache2D } from '../../caching/cache2D'
import { CachingService } from '../../caching/service'
import { DatabaseService } from '../../database/service'
import { ThreadTable } from './table'
import { Thread } from './types'

export class ThreadService extends Service {
  private table: ThreadTable
  private cacheById!: ServerCache<uuid, Thread>
  private cacheByName!: ServerCache2D<Thread>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()
    this.table = new ThreadTable()
  }

  async setup() {
    this.cacheById = await this.caching.newServerCache('cache_thread_by_id')
    this.cacheByName = await this.caching.newServerCache2D('cache_thread_by_name')

    await this.db.registerTable(this.table)
  }

  async get(id: uuid): Promise<Thread | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

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

    const rows = await this.query().where({ senderId, name })

    if (rows?.length) {
      const thread = rows[0] as Thread
      this.cacheByName.set(senderId, name, thread)
      return thread
    } else {
      const thread = {
        id: uuidv4(),
        senderId,
        name
      }

      await this.query().insert(thread)
      this.cacheByName.set(senderId, name, thread)
      this.cacheById.set(thread.id, thread)

      return thread
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
