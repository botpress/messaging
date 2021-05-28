import { Knex } from 'knex'
import { Table } from '../base/table'

export class ProviderTable extends Table {
  get id() {
    return 'providers'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('name').unique()
  }
}
