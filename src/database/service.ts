import fs from 'fs'
import knex, { Knex } from 'knex'
import path from 'path'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'

export class DatabaseService extends Service {
  public knex!: Knex

  constructor(private configService: ConfigService) {
    super()
  }

  async setup() {
    // TODO: this path will change in production mode
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist')
    }

    const provider = this.configService.current.database.type

    if (provider === 'sqlite') {
      this.knex = knex({
        client: 'sqlite3',
        connection: { filename: path.join('dist', 'db.sqlite') },
        useNullAsDefault: true
      })
    } else if (provider === 'postgres') {
      this.knex = knex({
        client: 'postgres',
        connection: this.configService.current.database.connection,
        useNullAsDefault: true
      })
    }
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
