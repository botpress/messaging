import * as Knex from 'knex'

export const getTableId = (tableName: string) => `${tableName}${process.env.DATABASE_SUFFIX || ''}`

export abstract class Table {
  get id() {
    return getTableId(this.name)
  }

  abstract get name(): string

  abstract create(table: Knex.Knex.CreateTableBuilder): void
}
