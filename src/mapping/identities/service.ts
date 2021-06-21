import { v4 as uuidv4 } from 'uuid'
import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { DatabaseService } from '../../database/service'
import { IdentityTable } from './table'
import { Identity } from './types'

export class IdentityService extends Service {
  private table: IdentityTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new IdentityTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async get(id: uuid): Promise<Identity | undefined> {
    const rows = await this.query().where({ id })

    if (rows?.length) {
      return rows[0]
    } else {
      return undefined
    }
  }

  async map(tunnelId: uuid, name: string): Promise<Identity> {
    const rows = await this.query().where({ tunnelId, name })

    if (rows?.length) {
      return rows[0]
    } else {
      const identity = {
        id: uuidv4(),
        tunnelId,
        name
      }

      await this.query().insert(identity)

      return identity
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
