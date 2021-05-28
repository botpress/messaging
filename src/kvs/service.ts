import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { DatabaseService } from '../database/service'
import { KvsTable } from './table'

export class KvsService extends Service {
  private table: KvsTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new KvsTable()
  }

  async setup() {
    await this.db.table(this.table.id, this.table.create)
  }

  async get(key: string): Promise<any> {
    const rows = await this.query().where({ key })
    if (rows?.length) {
      return rows[0].value
    } else {
      return undefined
    }
  }

  async set(key: string, value: any): Promise<void> {
    if (await this.get(key)) {
      await this.query().where({ key }).update({ value })
    } else {
      await this.query().insert({ id: uuidv4(), key, value: this.db.setJson(value) })
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
