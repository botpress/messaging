import { Service } from '@botpress/messaging-engine'
import fs from 'fs'
import knex, { Knex } from 'knex'
import path from 'path'
import { Table } from '../base/table'
import { Logger } from '../logger/types'

export class DatabaseService extends Service {
  public knex!: Knex
  private url!: string
  private pool!: Knex.PoolConfig
  private isLite!: boolean
  private logger = new Logger('Database')

  async setup() {
    this.url = process.env.DATABASE_URL!
    this.loadPoolConfig()

    if (this.url?.startsWith('postgres')) {
      await this.setupPostgres()
    } else {
      await this.setupSqlite()
    }
  }

  private loadPoolConfig() {
    const getPoolConfig = () => {
      try {
        return process.env.DATABASE_POOL ? JSON.parse(process.env.DATABASE_POOL) : undefined
      } catch {
        this.logger.warn('DATABASE_POOL is not valid json')
        return undefined
      }
    }

    this.pool = { log: (message: any) => this.logger.warn(`[pool] ${message}`), ...getPoolConfig() }
  }

  private async setupPostgres() {
    this.isLite = false
    this.knex = knex({
      client: 'postgres',
      connection: this.url,
      useNullAsDefault: true,
      pool: this.pool
    })
  }

  private async setupSqlite() {
    let filename = this.url
    if (!filename) {
      if (process.env.NODE_ENV === 'production') {
        filename = path.join(process.cwd(), 'data', 'db.sqlite')
      } else {
        filename = path.join(process.cwd(), path.join('dist', 'data'), 'db.sqlite')
      }
    }

    if (!fs.existsSync(path.dirname(filename))) {
      fs.mkdirSync(path.dirname(filename), { recursive: true })
    }

    this.isLite = true
    this.knex = knex({
      client: 'sqlite3',
      connection: { filename },
      useNullAsDefault: true,
      pool: {
        afterCreate: (conn: any, cb: any) => {
          conn.run('PRAGMA foreign_keys = ON', cb)
        },
        ...this.pool
      }
    })
  }

  async destroy() {
    try {
      await this.knex.destroy()
    } catch (e) {
      this.logger.error(e, 'Failed to destroy database connection')
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

  getBool(bool: any): boolean {
    if (this.isLite) {
      return !!bool
    }
    return bool
  }

  setBool(bool: boolean): any {
    if (this.isLite) {
      return bool ? 1 : 0
    }
    return bool
  }
}
