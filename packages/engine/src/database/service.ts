import fs from 'fs'
import knex, { Knex } from 'knex'
import path from 'path'
import yn from 'yn'
import { Service } from '../base/service'
import { Table } from '../base/table'
import { Logger } from '../logger/types'

export class DatabaseService extends Service {
  public knex!: Knex
  private tables: Table[] = []
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
    if (yn(process.env.DATABASE_TRANSIENT)) {
      const trx = await this.knex.transaction()
      try {
        for (const table of this.tables.reverse()) {
          await trx.schema.dropTable(table.id)
          this.logger.debug(`Dropped table '${table.id}'`)
        }
        await trx.commit()
      } catch (e) {
        await trx.rollback()
        this.logger.error(e, 'Failed to destroy transient database')
      }
    }

    try {
      await this.knex.destroy()
    } catch (e) {
      this.logger.error(e, 'Failed to destroy database connection')
    }
  }

  async registerTable(table: Table) {
    this.tables.push(table)
  }

  async createTables(trx: Knex.Transaction) {
    for (const table of this.tables) {
      if (!(await trx.schema.hasTable(table.id))) {
        await trx.schema.createTable(table.id, table.create)
        this.logger.debug(`Created table '${table.id}'`)
      }
    }
  }

  getIsLite() {
    return this.isLite
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

  getBool(bool: boolean | number): boolean {
    if (this.isLite || typeof bool === 'number') {
      return !!bool
    }
    return bool
  }

  setBool(bool: boolean): boolean | number {
    if (this.isLite) {
      return bool ? 1 : 0
    }
    return bool
  }
}
