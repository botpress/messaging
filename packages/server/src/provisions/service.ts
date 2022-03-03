import { ClientService } from '@botpress/framework'
import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, Service } from '@botpress/messaging-engine'
import { ProviderService } from '../providers/service'
import { ProvisionTable } from './table'
import { Provision } from './types'

export class ProvisionService extends Service {
  private table: ProvisionTable

  constructor(
    private db: DatabaseService,
    private caching: CachingService,
    private clients: ClientService,
    private providers: ProviderService
  ) {
    super()
    this.table = new ProvisionTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async create(clientId: uuid, providerId: uuid): Promise<Provision> {
    throw new Error('impl')
  }

  async fetchByClientId(clientId: uuid): Promise<Provision | undefined> {
    throw new Error('impl')
  }

  async getByClientId(clientId: uuid): Promise<Provision> {
    throw new Error('impl')
  }

  async fetchByProviderId(providerId: uuid): Promise<Provision | undefined> {
    throw new Error('impl')
  }

  async getByProviderId(providerId: uuid): Promise<Provision> {
    throw new Error('impl')
  }
}
