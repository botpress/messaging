import { Knex } from 'knex'
import { Table } from '../base/table'

export class KvsTable extends Table {
  get id() {
    return 'kvs'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('clients')
    table.string('key').unique()
    table.jsonb('value')
    table.index('key')
  }
}
