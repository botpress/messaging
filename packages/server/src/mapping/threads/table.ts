import { Knex } from 'knex'
import { Table } from '../../base/table'

export class ThreadTable extends Table {
  get id() {
    return 'msg_threads'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('senderId').references('id').inTable('msg_senders').notNullable()
    table.string('name').notNullable()
    table.unique(['senderId', 'name'])
  }
}
