import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { CryptoService } from '../crypto/service'
import { DatabaseService } from '../database/service'
import { ClientTable } from './table'
import { Client } from './types'

export class ClientService extends Service {
  private table: ClientTable
  private cacheById!: ServerCache<uuid, Client>
  private cacheByProvider!: ServerCache<uuid, Client>
  private cacheTokens!: ServerCache<uuid, string>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService
  ) {
    super()
    this.table = new ClientTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_client_by_id')
    this.cacheByProvider = await this.cachingService.newServerCache('cache_client_by_provider')
    this.cacheTokens = await this.cachingService.newServerCache('cache_client_tokens')

    await this.db.registerTable(this.table)
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

  async getById(id: string): Promise<Client | undefined> {
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

  async getByIdAndToken(id: string, token: string): Promise<Client | undefined> {
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

  async getByProviderId(providerId: string): Promise<Client | undefined> {
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

  async unlinkAllFromProvider(providerId: string): Promise<void> {
    this.cacheByProvider.del(providerId)

    // TODO: del cacheById for all affected

    await this.query().where({ providerId }).update({ providerId: null })
  }

  async updateProvider(clientId: uuid, providerId: uuid) {
    this.cacheByProvider.del(providerId)
    this.cacheById.del(clientId)

    await this.query().where({ clientId }).update({ providerId })
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
