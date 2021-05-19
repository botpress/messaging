import { DatabaseService } from '../database/service'
import { v4 as uuidv4 } from 'uuid'

export class KvsService {
  constructor(private db: DatabaseService) {}

  async setup() {
    await this.db.table('kvs', (table) => {
      table.uuid('id').primary()
      table.string('key').unique()
      table.jsonb('value')
      table.index('key')
    })
  }

  async get(key: string): Promise<any> {
    const rows = await this.query().where({ key })
    if (rows?.length) {
      return this.db.getJson(rows[0].value)
    } else {
      return undefined
    }
  }

  async set(key: string, value: any): Promise<void> {
    if (await this.get(key)) {
      await this.query()
        .where({ key })
        .update({ value: this.db.setJson(value) })
    } else {
      await this.query().insert({ id: uuidv4(), key, value: this.db.setJson(value) })
    }
  }

  private query() {
    return this.db.knex('kvs')
  }
}
