import LRU from 'lru-cache'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { CachingService } from '../caching/service'
import { DatabaseService } from '../database/service'
import { KvsTable } from './table'

export class KvsService extends Service {
  private table: KvsTable
  private cache: LRU<string, any>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new KvsTable()
    this.cache = this.cachingService.newLRU()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async get(key: string): Promise<any> {
    const cached = this.cache.get(key)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ key })
    if (rows?.length) {
      const value = this.db.getJson(rows[0].value)
      this.cache.set(key, value)
      return value
    } else {
      return undefined
    }
  }

  async set(key: string, value: any): Promise<void> {
    if (await this.get(key)) {
      this.cache.set(key, value)
      await this.query().where({ key }).update({ value })
    } else {
      this.cache.set(key, value)
      await this.query().insert({ id: uuidv4(), key, value: this.db.setJson(value) })
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
