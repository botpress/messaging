import * as Knex from 'knex'
import { ConfigService } from '../config/service'

export class DatabaseService {
  public knex!: Knex.Knex

  constructor(private configService: ConfigService) {}

  async setup() {
    this.knex = Knex.knex({ client: 'sqlite3', connection: { filename: 'dist/db.sqlite' }, useNullAsDefault: true })
  }

  async table(name: string, callback: (tableBuilder: Knex.Knex.CreateTableBuilder) => any) {
    if (!(await this.knex.schema.hasTable(name))) {
      await this.knex.schema.createTable(name, callback)
    }
  }

  getJson(string: string) {
    return JSON.parse(string)
  }

  setJson(object: any) {
    return JSON.stringify(object)
  }
}
