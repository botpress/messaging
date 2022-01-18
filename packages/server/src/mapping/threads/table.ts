import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ThreadTable extends Table {
  get name() {
    return 'msg_threads'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('senderId').references('id').inTable(getTableId('msg_senders')).notNullable()
    table.string('name').notNullable()
    table.unique(['senderId', 'name'])
  }
}
