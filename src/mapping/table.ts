import { Knex } from 'knex'
import { Table } from '../base/table'

export class MappingTable extends Table {
  get id() {
    return 'mapping'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('clientId').references('id').inTable('clients')
    table.uuid('channelId').references('id').inTable('channels')
    table.uuid('conversationId').references('id').inTable('conversations')
    table.string('foreignAppId').nullable()
    table.string('foreignUserId').nullable()
    table.string('foreignConversationId').nullable()
    table.primary(['clientId', 'channelId', 'conversationId'])
    table.index(['clientId', 'channelId', 'foreignAppId', 'foreignUserId', 'foreignConversationId'])
  }
}
