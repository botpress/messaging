import { Table } from '@botpress/engine'
import { Knex } from 'knex'

export class ConversationTable extends Table {
  get name() {
    return 'msg_conversations'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
    table.uuid('userId').references('id').inTable('msg_users').notNullable()
    table.timestamp('createdOn').notNullable()
    table.index(['userId', 'clientId'])
  }
}
