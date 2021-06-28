import { Knex } from 'knex'
import { Table } from '../base/table'

export class KvsTable extends Table {
  get id() {
    return 'msg_kvs'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('key').unique()
    table.jsonb('value')
    table.index('key')
  }
}
