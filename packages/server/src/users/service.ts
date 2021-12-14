import { User, uuid } from '@botpress/messaging-base'
import {
  Batcher,
  BatchingService,
  CachingService,
  DatabaseService,
  ServerCache,
  Service
} from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { UserEmitter, UserEvents, UserWatcher } from './events'
import { UserTable } from './table'

export class UserService extends Service {
  get events(): UserWatcher {
    return this.emitter
  }

  public batcher!: Batcher<User>

  private emitter: UserEmitter
  private table: UserTable
  private cache!: ServerCache<uuid, User>

  constructor(
    private db: DatabaseService,
    private cachingService: CachingService,
    private batchingService: BatchingService
  ) {
    super()
    this.table = new UserTable()
    this.emitter = new UserEmitter()
  }

  async setup() {
    this.batcher = await this.batchingService.newBatcher('batcher_users', [], this.handleBatchFlush.bind(this))

    this.cache = await this.cachingService.newServerCache('cache_user_by_id')

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: User[]) {
    await this.query().insert(batch)
  }

  async create(clientId: uuid): Promise<User> {
    const user = {
      id: uuidv4(),
      clientId
    }

    await this.batcher.push(user)
    this.cache.set(user.id, user)
    await this.emitter.emit(UserEvents.Created, { user })

    return user
  }

  public async fetch(id: uuid): Promise<User | undefined> {
    const cached = this.cache.get(id)
    if (cached) {
      return cached
    }

    await this.batcher.flush()

    const rows = await this.query().where({ id })
    if (rows?.length) {
      const user = rows[0] as User
      this.cache.set(id, user)
      return user
    }

    return undefined
  }

  public async get(id: uuid): Promise<User> {
    const val = await this.fetch(id)
    if (!val) {
      throw new Error(`User ${id} not found`)
    }
    return val
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
