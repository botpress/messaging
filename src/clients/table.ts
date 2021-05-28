import { Knex } from 'knex'
import { Table } from '../base/table'

export class ClientTable extends Table {
  get id() {
    return 'clients'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable('providers')
    // TODO: temporary. probably shouldn't store plain tokens like that
    table.string('token').unique()
  }
}
