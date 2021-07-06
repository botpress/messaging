import { Knex } from 'knex'
import { Table } from '../base/table'

export class ConversationTable extends Table {
  get id() {
    return 'msg_conversations'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
    table.string('userId').references('id').inTable('msg_users').notNullable()
    table.timestamp('createdOn').notNullable()
    table.index(['userId', 'clientId'])
  }
}
