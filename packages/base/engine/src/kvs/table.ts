import { Knex } from 'knex'
import { Table } from '../base/table'

export class KvsTable extends Table {
  get name() {
    return 'msg_kvs'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('key').unique().notNullable()
    table.jsonb('value').notNullable()
  }
}
