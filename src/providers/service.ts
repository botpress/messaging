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
      table.jsonb('config')
    })
  }

  async loadConfig() {
    for (const config of this.configService.current.providers) {
      const inDb = await this.getByName(config.name)

      if (!inDb) {
        const provider = {
          id: uuidv4(),
          name: config.name,
          config: config.channels
        }

        await this.create(provider)

        if (config.client && !(await this.clientService.getByToken(config.client?.token))) {
          await this.clientService.create(provider.id, config.client?.token)
        }
      } else {
        await this.update((await this.getByName(config.name))?.id!, { config: config.channels })
      }
    }
  }

  async getByName(name: string) {
    // TODO: caching

    const rows = await this.query().where({ name })
    if (rows?.length) {
      return rows[0] as Provider
    } else {
      return undefined
    }
  }

  async getName(id: uuid) {
    // TODO: caching

    const rows = await this.query().select('name').where({ id })
    if (rows?.length) {
      return rows[0].name as string
    } else {
      return undefined
    }
  }

  async getClientId(id: uuid) {
    const rows = await this.db.knex('clients').select('id').where({ providerId: id })
    if (rows?.length) {
      return rows[0].id as string
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
  config: any
}
