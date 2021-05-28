import fs from 'fs'
import knex, { Knex } from 'knex'
import path from 'path'
import { Service } from '../base/service'
import { Table } from '../base/table'
import { ConfigService } from '../config/service'

export class DatabaseService extends Service {
  public knex!: Knex

  constructor(private configService: ConfigService) {
    super()
  }

  async setup() {
    const provider = this.configService.current.database.type

    if (provider === 'sqlite') {
      // TODO: this path will change in production mode
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist')
      }

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

  async registerTable(table: Table) {
    if (!(await this.knex.schema.hasTable(table.id))) {
      await this.knex.schema.createTable(table.id, table.create)
    }
  }

  getJson(val: any): any {
    // TODO: does this work with sqlite as well?
    return val // JSON.parse(string)
  }

  setJson(object: any): any {
    // TODO: does this work with sqlite as well?
    return object // JSON.stringify(object)
  }

  getDate(string: string) {
    return new Date(string)
  }

  setDate(date: Date | undefined) {
    return date?.toISOString()
  }
}
