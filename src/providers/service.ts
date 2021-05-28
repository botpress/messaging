import LRU from 'lru-cache'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'
import { ProviderTable } from './table'

export class ProviderService extends Service {
  private table: ProviderTable
  private cacheById: LRU<uuid, Provider>
  private cacheByName: LRU<string, Provider>

  constructor(private db: DatabaseService, private configService: ConfigService) {
    super()
    this.table = new ProviderTable()
    this.cacheById = new LRU({ maxAge: ms('5min'), max: 50000 })
    this.cacheByName = new LRU({ maxAge: ms('5min'), max: 50000 })
  }

  async setup() {
    await this.db.registerTable(this.table)

    for (const config of this.configService.current.providers) {
      const provider = await this.getByName(config.name)
      if (!provider) {
        await this.create({
          id: uuidv4(),
          name: config.name,
          config: config.channels
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

  async getClientId(id: uuid): Promise<string | undefined> {
    // TODO: this function shouldn't be here
    // TODO: cache this

    const rows = await this.db.knex('clients').select('id').where({ providerId: id })
    if (rows?.length) {
      return rows[0].id as string
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}

export interface Provider {
  id: uuid
  name: string
  config: any
}
