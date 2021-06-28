import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { DatabaseService } from '../database/service'
import { ProviderTable } from './table'
import { Provider } from './types'

export class ProviderService extends Service {
  private table: ProviderTable
  private cacheById!: ServerCache<uuid, Provider>
  private cacheByName!: ServerCache<string, Provider>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new ProviderTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_provider_by_id')
    this.cacheByName = await this.cachingService.newServerCache('cache_provider_by_name')

    await this.db.registerTable(this.table)
  }

  async create(forceId?: string, forceName?: string, sandbox?: boolean): Promise<Provider> {
    const id = forceId ?? uuidv4()
    const provider = {
      id,
      name: forceName ?? crypto.randomBytes(18).toString('base64'),
      sandbox: sandbox === undefined ? false : sandbox
    }

    await this.query().insert(provider)

    return provider
  }

  async getByName(name: string): Promise<Provider | undefined> {
    const cached = this.cacheByName.get(name)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ name })
    if (rows?.length) {
      const provider = rows[0] as Provider

      this.cacheById.set(provider.id, provider)
      this.cacheByName.set(provider.name, provider)

      return provider
    }

    return undefined
  }

  async getById(id: uuid): Promise<Provider | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })
    if (rows?.length) {
      const provider = rows[0] as Provider

      this.cacheById.set(id, provider)
      this.cacheByName.set(provider.name, provider)

      return provider
    }

    return undefined
  }

  async updateSandbox(id: uuid, sandbox: boolean) {
    const provider = (await this.getById(id))!

    await this.query().where({ id }).update({ sandbox })

    this.cacheById.del(id, true)
    this.cacheByName.del(provider.name, true)
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
