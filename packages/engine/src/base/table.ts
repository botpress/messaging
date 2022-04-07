import * as Knex from 'knex'

export abstract class Table {
  get id() {
    return this.name
  }

  abstract get name(): string

  abstract create(table: Knex.Knex.CreateTableBuilder): void
}
