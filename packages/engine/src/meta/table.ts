import { Knex } from 'knex'
import { Table } from '../base/table'

export class MetaTable extends Table {
  get id() {
    return 'msg_meta'
  }

  create(table: Knex.CreateTableBuilder) {
    table.timestamp('time').primary()
    table.jsonb('data')
  }
}
