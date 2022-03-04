import knex, { Knex } from 'knex'
import schemaInspector from 'knex-schema-inspector'
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector'
import { Table } from 'knex-schema-inspector/dist/types/table'
import path from 'path'

export class Inspector {
  private _knex: Knex
  private _url: string
  private _isLite: boolean = false
  private _inspector: SchemaInspector

  constructor(private _suffix: string) {
    this._url =
      process.env.DATABASE_URL || path.join(__dirname, './../../../../../test/.test-data', `${this._suffix}.sqlite`)

    if (this._url.startsWith('postgres')) {
      this._knex = knex({
        client: 'postgres',
        connection: this._url,
        useNullAsDefault: true
      })
    } else {
      this._isLite = true
      this._knex = knex({
        client: 'sqlite3',
        connection: { filename: this._url },
        useNullAsDefault: true
      })
    }

    this._inspector = schemaInspector(this._knex)
  }

  private _removeSuffix(info: string): string {
    return info.replace(this._suffix, '')
  }

  private _addSuffix(info: string): string {
    return `${info}${this._suffix}`
  }

  public async tables(): Promise<Table[]> {
    const tables = await this._inspector.tableInfo()

    if (this._isLite) {
      return tables
    }

    return tables.filter((t) => t.name.includes(this._suffix)).map((t) => ({ ...t, name: this._removeSuffix(t.name) }))
  }

  public async columns(table: string) {
    const columns = await this._inspector.columns(this._addSuffix(table))

    if (!columns) {
      return undefined
    }

    return columns.map((c) => ({ ...c, table: this._removeSuffix(c.table) }))
  }

  public async columnInfo(table: string, column: string) {
    const columnInfo = await this._inspector.columnInfo(this._addSuffix(table), column)

    if (!columnInfo) {
      return undefined
    }

    return {
      ...columnInfo,
      table: this._removeSuffix(columnInfo.table),
      foreign_key_table: columnInfo.foreign_key_table && this._removeSuffix(columnInfo.foreign_key_table)
    }
  }

  public async destroy() {
    return this._knex.destroy()
  }
}
