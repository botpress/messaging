import { Knex } from 'knex'
import { Table } from '../../base/table'

export class ConvmapTable extends Table {
  get id() {
    return 'msg_convmap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('tunnelId').references('id').inTable('msg_tunnels').notNullable()
    table.uuid('conversationId').references('id').inTable('msg_conversations').notNullable()
    table.uuid('threadId').references('id').inTable('msg_threads').notNullable()
    // TODO: remove this constraint
    table.unique(['tunnelId', 'conversationId'])
    table.unique(['tunnelId', 'threadId'])
  }
}
