import { uuid } from '@botpress/messaging-base'
import {
  Batcher,
  BatchingService,
  CachingService,
  CryptoService,
  DatabaseService,
  ServerCache,
  Service
} from '@botpress/messaging-engine'
import crypto from 'crypto'
import { validate as validateUuid, v4 as uuidv4 } from 'uuid'
import { UserService } from '../users/service'
import { UserTokenTable } from './table'
import { UserToken } from './types'

export const USER_TOKEN_LENGTH = 66

export class UserTokenService extends Service {
  public batcher!: Batcher<UserToken>

  private table: UserTokenTable
  private cacheById!: ServerCache<uuid, UserToken>
  private cacheTokens!: ServerCache<uuid, string>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService,
    private batchingService: BatchingService,
    private userService: UserService
  ) {
    super()
    this.table = new UserTokenTable()
  }

  async setup() {
    this.batcher = await this.batchingService.newBatcher(
      'batcher_user_tokens',
      [this.userService.batcher],
      this.handleBatchFlush.bind(this)
    )

    this.cacheById = await this.cachingService.newServerCache('cache_user_token_by_id')
    this.cacheTokens = await this.cachingService.newServerCache('cache_user_token_raw')

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: UserToken[]) {
    const rows = batch.map((x) => this.serialize(x))
    await this.query().insert(rows)
  }

  async generateToken(): Promise<string> {
    return crypto.randomBytes(USER_TOKEN_LENGTH).toString('base64')
  }

  async create(userId: uuid, token: string, expiry: Date | undefined): Promise<UserToken> {
    const userToken = {
      id: uuidv4(),
      userId,
      token: await this.cryptoService.hash(token),
      expiry
    }

    await this.batcher.push(userToken)
    this.cacheById.set(userToken.id, userToken)

    return userToken
  }

  async fetchById(id: uuid): Promise<UserToken | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ id })

    if (rows?.length) {
      const userToken = this.deserialize(rows[0])
      this.cacheById.set(id, userToken)
      return userToken
    } else {
      return undefined
    }
  }

  async verifyToken(userId: string, rawToken: string): Promise<UserToken | undefined> {
    if (!rawToken?.length) {
      return undefined
    }

    const [id, token] = rawToken.split('.')

    if (!validateUuid(id) || !token?.length) {
      return undefined
    }

    const userToken = await this.fetchById(id)
    if (!userToken) {
      return undefined
    }

    if (userToken.userId !== userId) {
      return undefined
    }

    if (userToken.expiry && Date.now() > userToken.expiry.getTime()) {
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

  private query() {
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
      expiry: userToken.expiry ? this.db.getDate(userToken.expiry) : undefined
    }
  }
}
