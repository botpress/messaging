import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ClientService } from '../clients/service'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'

export class ProviderService extends Service {
  constructor(private db: DatabaseService, private configService: ConfigService, private clientService: ClientService) {
    super()
  }

  async setup() {
    await this.db.table('providers', (table) => {
      table.uuid('id').primary()
      table.string('name').unique()
      // TODO: solve this circular dependency
      table.uuid('clientId')
      table.jsonb('config')
    })

    for (const config of this.configService.current.providers) {
      const inDb = await this.getByName(config.name)
      if (!inDb) {
        const provider = {
          id: uuidv4(),
          name: config.name,
          clientId: <any>null,
          config: config.channels
        }

        await this.create(provider)

        const client = config.client
          ? (await this.clientService.getByToken(config.client?.token)) ??
            (await this.clientService.create(provider.id, config.client?.token))
          : undefined

        if (client) {
          await this.update(provider.id, { clientId: client.id })
        }
      }
    }
  }

  async getByName(name: string) {
    const rows = await this.query().where({ name })
    if (rows?.length) {
      return rows[0] as Provider
    } else {
      return undefined
    }
  }

  async create(values: Provider) {
    return this.query().insert(values)
  }

  async update(id: uuid, values: Partial<Provider>) {
    return this.query().where({ id }).update(values)
  }

  private query() {
    return this.db.knex('providers')
  }
}

export interface Provider {
  id: uuid
  name: string
  clientId?: string
  config: any
}
