import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class MetaTable extends Table {
  get id() {
    return 'msg_meta'
  }

  create(table: Knex.CreateTableBuilder) {
    table.timestamp('time').primary()
    table.jsonb('data')
  }
}
