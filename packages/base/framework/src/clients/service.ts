import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, ServerCache, Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { ClientTable } from './table'
import { Client } from './types'

export class ClientService extends Service {
  private table: ClientTable
  private cacheById!: ServerCache<uuid, Client>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new ClientTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_client_by_id')
    await this.db.registerTable(this.table)
  }

  async create(forceId?: string): Promise<Client> {
    const client: Client = {
      id: forceId ?? uuidv4()
    }

    await this.query().insert(client)

    return client
  }

  async fetchById(id: uuid): Promise<Client | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })
    if (rows?.length) {
      const client = rows[0] as Client
      this.cacheById.set(id, client)
      return client
    } else {
      return undefined
    }
  }

  async getById(id: uuid): Promise<Client> {
    const val = await this.fetchById(id)
    if (!val) {
      throw Error(`Client ${id} not found`)
    }
    return val
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
