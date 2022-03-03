import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, ServerCache, Service } from '@botpress/messaging-engine'
import { ProvisionTable } from './table'
import { Provision } from './types'

export class ProvisionService extends Service {
  private table: ProvisionTable
  private cacheByClientId!: ServerCache<uuid, Provision>
  private cacheByProviderId!: ServerCache<uuid, Provision>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()
    this.table = new ProvisionTable()
  }

  async setup() {
    this.cacheByClientId = await this.caching.newServerCache('cache_provision_by_client_id')
    this.cacheByProviderId = await this.caching.newServerCache('cache_provision_by_provider_id')

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
    const cached = this.cacheByClientId.get(clientId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId })
    if (rows?.length) {
      const provision = rows[0] as Provision

      this.cacheByClientId.set(clientId, provision)
      this.cacheByProviderId.set(provision.providerId, provision)

      return provision
    } else {
      return undefined
    }
  }

  async getByClientId(clientId: uuid): Promise<Provision> {
    const val = await this.fetchByClientId(clientId)
    if (!val) {
      throw new Error(`Provision with clientId ${clientId} not found`)
    }
    return val
  }

  async fetchByProviderId(providerId: uuid): Promise<Provision | undefined> {
    const cached = this.cacheByProviderId.get(providerId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ providerId })
    if (rows?.length) {
      const provision = rows[0] as Provision

      this.cacheByProviderId.set(providerId, provision)
      this.cacheByClientId.set(provision.clientId, provision)

      return provision
    } else {
      return undefined
    }
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
