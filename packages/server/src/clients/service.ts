import { uuid } from '@botpress/messaging-base'
import { DatabaseService, Service } from '@botpress/messaging-engine'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { CryptoService } from '../crypto/service'
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
  private cacheTokens!: ServerCache<uuid, string>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
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
    this.cacheTokens = await this.cachingService.newServerCache('cache_client_tokens')

    await this.db.registerTable(this.table)

    this.providerService.events.on(ProviderEvents.Deleting, this.onProviderDeleting.bind(this))
  }

  async generateToken(): Promise<string> {
    return crypto.randomBytes(66).toString('base64')
  }

  async create(providerId: uuid, token: string, forceId?: string): Promise<Client> {
    const client: Client = {
      id: forceId ?? uuidv4(),
      providerId,
      token: await this.cryptoService.hash(token)
    }

    await this.query().insert(client)

    return client
  }

  async getById(id: uuid): Promise<Client | undefined> {
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

  async getByIdAndToken(id: uuid, token: string): Promise<Client | undefined> {
    const client = await this.getById(id)
    if (!client) {
      return undefined
    }

    const cachedToken = this.cacheTokens.get(id)
    if (cachedToken) {
      if (token === cachedToken) {
        return client
      } else {
        return undefined
      }
    }

    if (await this.cryptoService.compareHash(client.token!, token)) {
      this.cacheTokens.set(id, token)
      return client
    } else {
      return undefined
    }
  }

  async getByProviderId(providerId: uuid): Promise<Client | undefined> {
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

  async updateProvider(id: uuid, providerId: uuid | null) {
    const oldClient = (await this.getById(id))!

    this.cacheByProvider.del(oldClient.providerId, true)
    this.cacheById.del(id, true)
    this.cacheTokens.del(id, true)

    await this.query().where({ id }).update({ providerId })
    await this.emitter.emit(ClientEvents.Updated, { clientId: id, oldClient })
  }

  async updateToken(id: uuid, token: string) {
    const oldClient = (await this.getById(id))!

    this.cacheByProvider.del(oldClient.providerId, true)
    this.cacheById.del(id, true)
    this.cacheTokens.del(id, true)

    await this.query()
      .where({ id })
      .update({ token: await this.cryptoService.hash(token) })
    await this.emitter.emit(ClientEvents.Updated, { clientId: id, oldClient })
  }

  private async onProviderDeleting({ providerId }: ProviderDeletingEvent) {
    const client = await this.getByProviderId(providerId)

    if (client) {
      await this.updateProvider(client.id, null)
    }
  }

  query() {
    return this.db.knex(this.table.id)
  }
}
