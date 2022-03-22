import knex, { Knex } from 'knex'
import schemaInspector from 'knex-schema-inspector'
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector'
import { Table } from 'knex-schema-inspector/dist/types/table'
import path from 'path'

export const setupConnection = (suffix: string) => {
  const url = process.env.DATABASE_URL || path.join(__dirname, './../../../../../test/.test-data', `${suffix}.sqlite`)
  let isLite = false
  let conn: Knex

  if (url.startsWith('postgres')) {
    conn = knex({
      client: 'postgres',
      connection: url,
      useNullAsDefault: true
    })
  } else {
    isLite = true
    conn = knex({
      client: 'sqlite3',
      connection: { filename: url },
      useNullAsDefault: true
    })
  }

  return { url, isLite, conn }
}

export class Inspector {
  private knex: Knex
  private isLite: boolean = false
  private inspector: SchemaInspector

  constructor(private suffix: string) {
    const { isLite, conn } = setupConnection(suffix)
    this.isLite = isLite
    this.knex = conn

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
