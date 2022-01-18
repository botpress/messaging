import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ConvmapTable extends Table {
  get name() {
    return 'msg_convmap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('tunnelId').references('id').inTable(getTableId('msg_tunnels')).notNullable()
    table.uuid('conversationId').references('id').inTable(getTableId('msg_conversations')).notNullable()
    table.uuid('threadId').references('id').inTable(getTableId('msg_threads')).notNullable()
    // TODO: remove this constraint
    table.unique(['tunnelId', 'conversationId'])
    table.unique(['tunnelId', 'threadId'])
  }
}
