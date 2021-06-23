import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'
import { UserTable } from './table'
import { User } from './types'

export class UserService extends Service {
  private table: UserTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new UserTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async create(clientId: uuid): Promise<User> {
    const user = {
      id: uuidv4(),
      clientId
    }

    await this.query().insert(user)

    return user
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
