import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class KvsTable extends Table {
  get id() {
    return 'msg_kvs'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('key').unique().notNullable()
    table.jsonb('value').notNullable()
  }
}
