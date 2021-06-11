import { Knex } from 'knex'
import { Table } from '../base/table'

export class ClientTable extends Table {
  get id() {
    return 'clients'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable('providers')
    table.string('token').unique()
  }
}
