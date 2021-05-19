import knex, { Knex } from 'knex'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'

export class DatabaseService extends Service {
  public knex!: Knex

  constructor(private configService: ConfigService) {
    super()
  }

  async setup() {
    this.knex = knex({ client: 'sqlite3', connection: { filename: 'dist/db.sqlite' }, useNullAsDefault: true })
  }

  async table(name: string, callback: (tableBuilder: Knex.CreateTableBuilder) => any) {
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

  getDate(string: string) {
    return new Date(string)
  }

  setDate(date: Date | undefined) {
    return date?.toISOString()
  }
}
