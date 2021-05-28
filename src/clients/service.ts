import LRU from 'lru-cache'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { CachingService } from '../caching/service'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'
import { ProviderService } from '../providers/service'
import { ClientTable } from './table'
import { Client } from './types'

export class ClientService extends Service {
  private table: ClientTable
  private cacheByToken: LRU<string, Client>
  private cacheByProvider: LRU<uuid, Client>

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
    private cachingService: CachingService,
    private providers: ProviderService
  ) {
    super()
    this.table = new ClientTable()
    this.cacheByToken = this.cachingService.newLRU()
    this.cacheByProvider = this.cachingService.newLRU()
  }

  async setup() {
    await this.db.registerTable(this.table)

    for (const config of this.configService.current.clients) {
      const client = await this.getByToken(config.token)
      if (!client) {
        const provider = await this.providers.getByName(config.provider)
        await this.create(provider!.id, config.token)
      }
    }
  }

  async create(providerId: uuid, token: string): Promise<Client> {
    const client: Client = {
      id: uuidv4(),
      providerId,
      token
    }

    await this.query().insert(client)

    return client
  }

  async getByToken(token: string): Promise<Client | undefined> {
    const cached = this.cacheByToken.get(token)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ token: token ?? null })
    if (rows?.length) {
      const client = rows[0] as Client
      this.cacheByToken.set(token, client)
      return client
    } else {
      return undefined
    }
  }

  async getByProviderId(providerId: string): Promise<Client | undefined> {
    const cached = this.cacheByProvider.get(providerId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ providerId })
    if (rows?.length === 1) {
      const client = rows[0] as Client
      this.cacheByProvider.set(providerId, client)
      return client
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
