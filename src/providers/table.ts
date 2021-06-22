import { Knex } from 'knex'
import { Table } from '../base/table'

export class ProviderTable extends Table {
  get id() {
    return 'msg_providers'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('name').unique()
    table.boolean('sandbox')
  }
}
