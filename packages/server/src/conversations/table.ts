import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ConversationTable extends Table {
  get name() {
    return 'msg_conversations'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
    table.uuid('userId').references('id').inTable(getTableId('msg_users')).notNullable()
    table.timestamp('createdOn').notNullable()
    table.index(['userId', 'clientId'])
  }
}
