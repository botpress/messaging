import * as Knex from 'knex'

export abstract class Table {
  abstract get id(): string

  abstract create(table: Knex.Knex.CreateTableBuilder): void
}
