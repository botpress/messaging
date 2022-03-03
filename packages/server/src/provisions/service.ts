import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, Service } from '@botpress/messaging-engine'
import { ProvisionTable } from './table'
import { Provision } from './types'

export class ProvisionService extends Service {
  private table: ProvisionTable

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()
    this.table = new ProvisionTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async create(clientId: uuid, providerId: uuid): Promise<Provision> {
    const provision: Provision = {
      clientId,
      providerId
    }

    await this.query().insert(provision)
    return provision
  }

  async fetchByClientId(clientId: uuid): Promise<Provision | undefined> {
    const [row] = await this.query().where({ clientId })
    return row
  }

  async getByClientId(clientId: uuid): Promise<Provision> {
    const val = await this.fetchByClientId(clientId)
    if (!val) {
      throw new Error(`Provision with clientId ${clientId} not found`)
    }
    return val
  }

  async fetchByProviderId(providerId: uuid): Promise<Provision | undefined> {
    const [row] = await this.query().where({ providerId })
    return row
  }

  async getByProviderId(providerId: uuid): Promise<Provision> {
    const val = await this.fetchByProviderId(providerId)
    if (!val) {
      throw new Error(`Provision with providerId ${providerId} not found`)
    }
    return val
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
