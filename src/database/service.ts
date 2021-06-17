import fs from 'fs'
import knex, { Knex } from 'knex'
import path from 'path'
import { Service } from '../base/service'
import { Table } from '../base/table'
import { ConfigService } from '../config/service'
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
    const databaseUrl = process.env.DATABASE_URL || this.configService.current.database.connection

    if (databaseUrl?.startsWith('postgres')) {
      this.isLite = false
      this.knex = knex({
        client: 'postgres',
        connection: databaseUrl,
        useNullAsDefault: true
      })
    } else {
      let filename = databaseUrl
      if (!filename) {
        if (process.env.NODE_ENV === 'production') {
          filename = path.join(process.cwd(), 'data', 'db.sqlite')
        } else {
          filename = path.join(process.cwd(), 'dist', 'db.sqlite')
        }
      }

      if (!fs.existsSync(path.dirname(filename))) {
        fs.mkdirSync(path.dirname(filename))
      }

      this.isLite = true
      this.knex = knex({
        client: 'sqlite3',
        connection: { filename },
        useNullAsDefault: true
      })
    }
  }

  async destroy() {
    await this.knex.destroy()
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
