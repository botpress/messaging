import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'

// TODO: caching

export class ClientService extends Service {
  constructor(private db: DatabaseService) {
    super()
  }

  async setup() {
    await this.db.table('clients', (table) => {
      table.uuid('id').primary()
      table.uuid('providerId').references('id').inTable('providers')
      // TODO: temporary. probably shouldn't store plain tokens like that
      table.string('token').unique()
    })
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
    const rows = await this.query().where({ token: token ?? null })
    if (rows?.length) {
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
