import LRU from 'lru-cache'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'
import { ProviderService } from '../providers/service'

export class ClientService extends Service {
  private cache: LRU<string, Client>

  constructor(private db: DatabaseService, private configService: ConfigService, private providers: ProviderService) {
    super()

    this.cache = new LRU({ maxAge: ms('5min'), max: 50000 })
  }

  async setup() {
    await this.db.table('clients', (table) => {
      table.uuid('id').primary()
      table.uuid('providerId').references('id').inTable('providers')
      // TODO: temporary. probably shouldn't store plain tokens like that
      table.string('token').unique()
    })

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
    const cached = this.cache.get(token)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ token: token ?? null })
    if (rows?.length) {
      this.cache.set(token, rows[0])
      return rows[0]
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex('clients')
  }
}

export interface Client {
  id: uuid
  providerId: uuid
  token?: string
}
