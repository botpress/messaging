import { v4 as uuidv4 } from 'uuid'
import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { DatabaseService } from '../../database/service'
import { SenderTable } from './table'
import { Sender } from './types'

export class SenderService extends Service {
  private table: SenderTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new SenderTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async get(id: uuid): Promise<Sender | undefined> {
    const rows = await this.query().where({ id })

    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  async map(identityId: uuid, name: string): Promise<Sender> {
    const rows = await this.query().where({ identityId, name })

    if (rows?.length) {
      return rows[0]
    } else {
      const sender = {
        id: uuidv4(),
        identityId,
        name
      }

      await this.query().insert(sender)

      return sender
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
