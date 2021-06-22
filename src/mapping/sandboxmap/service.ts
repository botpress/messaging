import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { ServerCache } from '../../caching/cache'
import { CachingService } from '../../caching/service'
import { DatabaseService } from '../../database/service'
import { SandboxmapTable } from './table'
import { Sandboxmap } from './types'

export class SandboxmapService extends Service {
  private table: SandboxmapTable
  private cache!: ServerCache<string, Sandboxmap>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()

    this.table = new SandboxmapTable()
  }

  async setup() {
    this.cache = await this.caching.newServerCache('cache_sandboxmap')

    await this.db.registerTable(this.table)
  }

  async create(conduitId: uuid, identity: string, sender: string, thread: string, clientId: uuid): Promise<Sandboxmap> {
    const sandboxmap = {
      conduitId,
      identity,
      sender,
      thread,
      clientId
    }

    await this.query().insert(sandboxmap)
    this.cache.set(this.getCacheKey(conduitId, identity, sender, thread), sandboxmap)

    return sandboxmap
  }

  async get(conduitId: uuid, identity: string, sender: string, thread: string): Promise<Sandboxmap | undefined> {
    const key = this.getCacheKey(conduitId, identity, sender, thread)
    const cached = this.cache.get(key)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ conduitId, identity, sender, thread })

    if (rows?.length) {
      const sandboxmap = rows[0] as Sandboxmap
      this.cache.set(key, sandboxmap)
      return sandboxmap
    } else {
      return undefined
    }
  }

  private getCacheKey(conduitId: uuid, identity: string, sender: string, thread: string) {
    return `${conduitId}~${identity}~${sender}~${thread}`
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
