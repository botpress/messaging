import { uuid } from '@botpress/messaging-base'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { CachingService } from '../caching/service'
import { CryptoService } from '../crypto/service'
import { DatabaseService } from '../database/service'
import { UserTokenTable } from './table'
import { UserToken } from './types'

export class UserTokenService extends Service {
  private table: UserTokenTable

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService
  ) {
    super()
    this.table = new UserTokenTable()
  }

  async setup() {
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
    // TODO: add to cache

    return userToken
  }

  async get(id: uuid): Promise<UserToken | undefined> {
    // TODO: cache

    const rows = await this.query().where({ id })

    if (rows?.length) {
      const userToken = this.deserialize(rows[0])
      // this.cache.set(id, userToken)
      return userToken
    }

    return undefined
  }

  private query() {
    return this.db.knex(this.table.id)
  }

  public serialize(userToken: Partial<UserToken>) {
    return {
      ...userToken,
      expiry: this.db.setDate(userToken.expiry)
    }
  }

  public deserialize(userToken: any): UserToken {
    return {
      ...userToken,
      expiry: this.db.getDate(userToken.expiry)
    }
  }
}
