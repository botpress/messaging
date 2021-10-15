import { uuid } from '@botpress/messaging-base'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { CryptoService } from '../crypto/service'
import { DatabaseService } from '../database/service'
import { UserTokenTable } from './table'
import { UserToken } from './types'

export class UserTokenService extends Service {
  private table: UserTokenTable
  private cacheById!: ServerCache<uuid, UserToken>
  private cacheTokens!: ServerCache<uuid, string>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService
  ) {
    super()
    this.table = new UserTokenTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_user_token_by_id')
    this.cacheTokens = await this.cachingService.newServerCache('cache_user_token_raw')

    await this.db.registerTable(this.table)
  }

  async generateToken(): Promise<string> {
    return crypto.randomBytes(66).toString('base64')
  }

  async create(userId: uuid, token: string): Promise<UserToken> {
    const userToken = {
      id: uuidv4(),
      userId,
      token: await this.cryptoService.hash(token),
      // TODO: custom expiry
      expiry: undefined
    }

    // TODO: batching
    await this.query().insert(this.serialize(userToken))
    this.cacheById.set(userToken.id, userToken)

    return userToken
  }

  async getById(id: uuid): Promise<UserToken | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })

    if (rows?.length) {
      const userToken = this.deserialize(rows[0])
      this.cacheById.set(id, userToken)
      return userToken
    } else {
      return undefined
    }
  }

  async getByIdAndToken(id: string, token: string): Promise<UserToken | undefined> {
    // TODO: verify expiry

    const userToken = await this.getById(id)
    if (!userToken) {
      return undefined
    }

    const cachedToken = this.cacheTokens.get(id)
    if (cachedToken) {
      if (token === cachedToken) {
        return userToken
      } else {
        return undefined
      }
    }

    if (await this.cryptoService.compareHash(userToken.token, token)) {
      this.cacheTokens.set(id, token)
      return userToken
    } else {
      return undefined
    }
  }

  public query() {
    return this.db.knex(this.table.id)
  }

  private serialize(userToken: Partial<UserToken>) {
    return {
      ...userToken,
      expiry: this.db.setDate(userToken.expiry)
    }
  }

  private deserialize(userToken: any): UserToken {
    return {
      ...userToken,
      expiry: userToken.expirey ? this.db.getDate(userToken.expiry) : undefined
    }
  }
}
