import fs from 'fs'
import knex, { Knex } from 'knex'
import path from 'path'
import { Service } from '../base/service'
import { Table } from '../base/table'
import { ConfigService } from '../config/service'
import { LoggerService } from '../logger/service'
import { Logger } from '../logger/types'

export class DatabaseService extends Service {
  public knex!: Knex
  private isLite!: boolean
  private logger: Logger

  constructor(private configService: ConfigService) {
    super()
    this.logger = new Logger('Database')
  }

  async setup() {
    const provider = this.configService.current.database.type

    if (provider === 'sqlite') {
      // TODO: this path will change in production mode
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist')
      }

      this.isLite = true
      this.knex = knex({
        client: 'sqlite3',
        connection: { filename: path.join('dist', 'db.sqlite') },
        useNullAsDefault: true
      })
    } else if (provider === 'postgres') {
      this.isLite = false
      this.knex = knex({
        client: 'postgres',
        connection: this.configService.current.database.connection,
        useNullAsDefault: true
      })
    }
  }

  async registerTable(table: Table) {
    if (!(await this.knex.schema.hasTable(table.id))) {
      this.logger.debug(`Created table '${table.id}'`)

      await this.knex.schema.createTable(table.id, table.create)
    }
  }

  getJson(val: any): any {
    if (this.isLite) {
      return val ? JSON.parse(val) : undefined
    }
    return val
  }

  setJson(object: any): any {
    if (this.isLite) {
      return object ? JSON.stringify(object) : undefined
    }
    return object
  }

  getDate(string: string) {
    return new Date(string)
  }

  setDate(date: Date | undefined) {
    return date?.toISOString()
  }
}
