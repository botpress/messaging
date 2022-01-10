import { uuid } from '@botpress/messaging-base'
import { CachingService, CryptoService, DatabaseService, ServerCache, Service } from '@botpress/messaging-engine'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import yn from 'yn'
import { ClientTokenTable } from './table'
import { ClientToken } from './types'

export const USER_TOKEN_LENGTH = 66

export class ClientTokenService extends Service {
  private table: ClientTokenTable
  private cacheById!: ServerCache<uuid, ClientToken>
  private cacheTokens!: ServerCache<uuid, string>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService
  ) {
    super()
    this.table = new ClientTokenTable()
  }

  async setup() {
    if (!yn(process.env.ENABLE_EXPERIMENTAL_SOCKETS)) {
      // let's not create a table we don't need for now
      return
    }

    this.cacheById = await this.cachingService.newServerCache('cache_client_token_by_id')
    this.cacheTokens = await this.cachingService.newServerCache('cache_client_token_raw')

    await this.db.registerTable(this.table)
  }

  async generateToken(): Promise<string> {
    return crypto.randomBytes(USER_TOKEN_LENGTH).toString('base64')
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

  async verifyToken(id: string, token: string): Promise<ClientToken | undefined> {
    const clientToken = await this.fetchById(id)
    if (!clientToken) {
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
