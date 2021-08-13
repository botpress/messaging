import { uuid } from '@botpress/messaging-base'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { DatabaseService } from '../database/service'
import { KvsTable } from './table'

export class KvsService extends Service {
  private table: KvsTable
  private cache!: ServerCache<uuid, any>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new KvsTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_kvs')

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
      this.cache.set(key, value, undefined, true)
      await this.query()
        .where({ key })
        .update({ value: this.db.setJson(value) })
    } else {
      this.cache.set(key, value)
      await this.query().insert({ id: uuidv4(), key, value: this.db.setJson(value) })
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
