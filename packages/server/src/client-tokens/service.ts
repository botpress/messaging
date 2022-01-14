import { uuid } from '@botpress/messaging-base'
import { CachingService, CryptoService, DatabaseService, ServerCache, Service } from '@botpress/messaging-engine'
import crypto from 'crypto'
import { validate as validateUuid, v4 as uuidv4 } from 'uuid'
import { ClientTokenTable } from './table'
import { ClientToken } from './types'

export const CLIENT_TOKEN_LENGTH = 66

export class ClientTokenService extends Service {
  private table: ClientTokenTable
  private cacheById!: ServerCache<uuid, ClientToken>
  private cacheTokens!: ServerCache<uuid, string>
  private cacheTokensByClient!: ServerCache<uuid, ClientToken[]>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService
  ) {
    super()
    this.table = new ClientTokenTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_client_token_by_id')
    this.cacheTokens = await this.cachingService.newServerCache('cache_client_token_raw')
    this.cacheTokensByClient = await this.cachingService.newServerCache('cache_tokens_by_client')

    await this.db.registerTable(this.table)
  }

  async generateToken(): Promise<string> {
    return crypto.randomBytes(CLIENT_TOKEN_LENGTH).toString('base64')
  }

  async create(clientId: uuid, token: string, expiry: Date | undefined): Promise<ClientToken> {
    const clientToken = {
      id: uuidv4(),
      clientId,
      token: await this.cryptoService.hash(token),
      expiry
    }

    await this.query().insert(this.serialize(clientToken))
    this.cacheById.set(clientToken.id, clientToken)
    this.cacheTokensByClient.del(clientId, true)

    return clientToken
  }

  async fetchById(id: uuid): Promise<ClientToken | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })

    if (rows?.length) {
      const clientToken = this.deserialize(rows[0])
      this.cacheById.set(id, clientToken)
      return clientToken
    } else {
      return undefined
    }
  }

  async listByClient(clientId: uuid): Promise<ClientToken[]> {
    const cached = this.cacheTokensByClient.get(clientId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId })
    const tokens = rows.map((x) => this.deserialize(x))
    this.cacheTokensByClient.set(clientId, tokens)

    return tokens
  }

  async verifyToken(clientId: uuid, rawToken: string): Promise<ClientToken | undefined> {
    if (!validateUuid(clientId) || !rawToken?.length) {
      return undefined
    }

    const parts = rawToken.split('.')
    if (parts.length === 2) {
      const [id, token] = parts
      return this.verifyClientToken(clientId, id, token)
    } else if (parts.length === 1) {
      return this.verifyLegacyToken(clientId, rawToken)
    } else {
      return undefined
    }
  }

  private async verifyClientToken(clientId: uuid, id: uuid, token: string) {
    if (!validateUuid(id) || !token?.length) {
      return undefined
    }

    const clientToken = await this.fetchById(id)
    if (!clientToken) {
      return undefined
    }

    if (clientToken.clientId !== clientId) {
      return undefined
    }

    if (clientToken.expiry && Date.now() > clientToken.expiry.getTime()) {
      return undefined
    }

    const cachedToken = this.cacheTokens.get(id)
    if (cachedToken) {
      if (token === cachedToken) {
        return clientToken
      } else {
        return undefined
      }
    }

    if (await this.cryptoService.compareHash(clientToken.token, token)) {
      this.cacheTokens.set(id, token)
      return clientToken
    } else {
      return undefined
    }
  }

  private async verifyLegacyToken(clientId: uuid, token: string): Promise<ClientToken | undefined> {
    const clientTokens = await this.listByClient(clientId)
    if (clientTokens.length !== 1) {
      return undefined
    }

    return this.verifyClientToken(clientId, clientTokens[0].id, token)
  }

  private query() {
    return this.db.knex(this.table.id)
  }

  private serialize(clientToken: Partial<ClientToken>) {
    return {
      ...clientToken,
      expiry: this.db.setDate(clientToken.expiry)
    }
  }

  private deserialize(clientToken: any): ClientToken {
    return {
      ...clientToken,
      expiry: clientToken.expiry ? this.db.getDate(clientToken.expiry) : undefined
    }
  }
}
