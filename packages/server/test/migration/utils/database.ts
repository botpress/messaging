import knex, { Knex } from 'knex'
import schemaInspector from 'knex-schema-inspector'
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector'
import { Table } from 'knex-schema-inspector/dist/types/table'
import path from 'path'

export class Inspector {
  private knex: Knex
  private url: string
  private isLite: boolean = false
  private inspector: SchemaInspector

  constructor(private suffix: string) {
    this.url =
      process.env.DATABASE_URL || path.join(__dirname, './../../../../../test/.test-data', `${this.suffix}.sqlite`)

    if (this.url.startsWith('postgres')) {
      this.knex = knex({
        client: 'postgres',
        connection: this.url,
        useNullAsDefault: true
      })
    } else {
      this.isLite = true
      this.knex = knex({
        client: 'sqlite3',
        connection: { filename: this.url },
        useNullAsDefault: true
      })
    }

    this.inspector = schemaInspector(this.knex)
  }

  private removeSuffix(info: string): string {
    return info.replace(this.suffix, '')
  }

  private addSuffix(info: string): string {
    if (this.isLite) {
      return info
    }

    return `${info}${this.suffix}`
  }

  public async tables(): Promise<Table[]> {
    const tables = await this.inspector.tableInfo()

    if (this.isLite) {
      return tables
    }

    return tables.filter((t) => t.name.includes(this.suffix)).map((t) => ({ ...t, name: this.removeSuffix(t.name) }))
  }

  public async columns(table: string) {
    const columns = await this.inspector.columns(this.addSuffix(table))

    if (!columns) {
      return undefined
    }

    return columns.map((c) => ({ ...c, table: this.removeSuffix(c.table) }))
  }

  public async columnInfo(table: string, column: string) {
    const columnInfo = await this.inspector.columnInfo(this.addSuffix(table), column)

    if (!columnInfo) {
      return undefined
    }

    return {
      ...columnInfo,
      table: this.removeSuffix(columnInfo.table),
      foreign_key_table: columnInfo.foreign_key_table && this.removeSuffix(columnInfo.foreign_key_table)
    }
  }

  public async destroy() {
    return this.knex.destroy()
  }
}
