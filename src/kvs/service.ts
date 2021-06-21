import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { ServerCache2D } from '../caching/cache2D'
import { CachingService } from '../caching/service'
import { DatabaseService } from '../database/service'
import { KvsTable } from './table'

export class KvsService extends Service {
  private table: KvsTable
  private cache!: ServerCache2D<any>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new KvsTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache2D('cache_kvs')

    await this.db.registerTable(this.table)
  }

  async get(clientId: string, key: string): Promise<any> {
    const cached = this.cache.get(clientId, key)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ key })
    if (rows?.length) {
      const value = this.db.getJson(rows[0].value)
      this.cache.set(clientId, key, value)
      return value
    } else {
      return undefined
    }
  }

  async set(clientId: string, key: string, value: any): Promise<void> {
    if (await this.get(clientId, key)) {
      this.cache.set(clientId, key, value)
      await this.query().where({ key }).update({ value })
    } else {
      this.cache.set(clientId, key, value)
      await this.query().insert({ id: uuidv4(), key, value: this.db.setJson(value) })
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
