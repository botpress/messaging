import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { DatabaseService } from '../../database/service'
import { ConvmapTable } from './table'
import { Convmap } from './types'

export class ConvmapService extends Service {
  private table: ConvmapTable

  constructor(private db: DatabaseService) {
    super()

    this.table = new ConvmapTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async create(tunnelId: uuid, conversationId: uuid, threadId: uuid): Promise<Convmap> {
    const mapping = {
      tunnelId,
      conversationId,
      threadId
    }

    await this.query().insert(mapping)

    return mapping
  }

  async getByThreadId(tunnelId: uuid, threadId: uuid): Promise<Convmap | undefined> {
    const rows = await this.query().where({ tunnelId, threadId })

    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  async getByConversationId(tunnelId: uuid, conversationId: uuid): Promise<Convmap | undefined> {
    const rows = await this.query().where({ tunnelId, conversationId })

    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
