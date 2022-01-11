import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, ServerCache, Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { ProviderDeletingEvent, ProviderEvents } from '../providers/events'
import { ProviderService } from '../providers/service'
import { ClientEmitter, ClientEvents, ClientWatcher } from './events'
import { ClientTable } from './table'
import { Client } from './types'

export class ClientService extends Service {
  get events(): ClientWatcher {
    return this.emitter
  }

  private emitter: ClientEmitter
  private table: ClientTable
  private cacheById!: ServerCache<uuid, Client>
  private cacheByProvider!: ServerCache<uuid, Client>

  constructor(
    private db: DatabaseService,
    private cachingService: CachingService,
    private providerService: ProviderService
  ) {
    super()
    this.emitter = new ClientEmitter()
    this.table = new ClientTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_client_by_id')
    this.cacheByProvider = await this.cachingService.newServerCache('cache_client_by_provider')

    await this.db.registerTable(this.table)

    this.providerService.events.on(ProviderEvents.Deleting, this.onProviderDeleting.bind(this))
  }

  async create(providerId: uuid, forceId?: string): Promise<Client> {
    const client: Client = {
      id: forceId ?? uuidv4(),
      providerId
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

  async fetchByProviderId(providerId: uuid): Promise<Client | undefined> {
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

  async getByProviderId(providerId: uuid): Promise<Client> {
    const val = await this.fetchByProviderId(providerId)
    if (!val) {
      throw Error(`Client with provider ${providerId} not found`)
    }
    return val
  }

  async updateProvider(id: uuid, providerId: uuid | null) {
    const oldClient = await this.getById(id)

    this.cacheByProvider.del(oldClient.providerId, true)
    this.cacheById.del(id, true)

    await this.query().where({ id }).update({ providerId })
    await this.emitter.emit(ClientEvents.Updated, { clientId: id, oldClient })
  }

  private async onProviderDeleting({ providerId }: ProviderDeletingEvent) {
    const client = await this.fetchByProviderId(providerId)

    if (client) {
      await this.updateProvider(client.id, null)
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
