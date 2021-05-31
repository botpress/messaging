import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'
import { ProviderTable } from './table'
import { Provider } from './types'

export class ProviderService extends Service {
  private table: ProviderTable
  private cacheById!: ServerCache<uuid, Provider>
  private cacheByName!: ServerCache<string, Provider>

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
    private cachingService: CachingService
  ) {
    super()
    this.table = new ProviderTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_provider_by_id')
    this.cacheByName = await this.cachingService.newServerCache('cache_provider_by_name')

    await this.db.registerTable(this.table)

    for (const config of this.configService.current.providers) {
      const provider = await this.getByName(config.name)
      if (!provider) {
        await this.create({
          id: uuidv4(),
          name: config.name
        })
      }
    }
  }

  async create(values: Provider): Promise<Provider> {
    return this.query().insert(values)
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

  private query() {
    return this.db.knex(this.table.id)
  }
}
