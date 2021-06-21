import { v4 as uuidv4 } from 'uuid'
import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { DatabaseService } from '../../database/service'
import { ThreadTable } from './table'
import { Thread } from './types'

export class ThreadService extends Service {
  private table: ThreadTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new ThreadTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async get(id: uuid): Promise<Thread | undefined> {
    const rows = await this.query().where({ id })

    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  async map(senderId: uuid, name: string): Promise<Thread> {
    const rows = await this.query().where({ senderId, name })

    if (rows?.length) {
      return rows[0]
    } else {
      const thread = {
        id: uuidv4(),
        senderId,
        name
      }

      await this.query().insert(thread)

      return thread
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
