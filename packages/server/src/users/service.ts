import { User, uuid } from '@botpress/messaging-base'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { Batcher } from '../batching/batcher'
import { BatchingService } from '../batching/service'
import { DatabaseService } from '../database/service'
import { UserTable } from './table'

export class UserService extends Service {
  public batcher!: Batcher<User>

  private table: UserTable

  constructor(private db: DatabaseService, private batchingService: BatchingService) {
    super()
    this.table = new UserTable()
  }

  async setup() {
    this.batcher = await this.batchingService.newBatcher('batcher_users', [], this.handleBatchFlush.bind(this))

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

    return user
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
