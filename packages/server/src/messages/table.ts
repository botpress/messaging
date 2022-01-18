import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class MessageTable extends Table {
  get name() {
    return 'msg_messages'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table
      .uuid('conversationId')
      .references('id')
      .inTable(getTableId('msg_conversations'))
      .notNullable()
      .onDelete('cascade')
    table.uuid('authorId').references('id').inTable(getTableId('msg_users')).nullable()
    table.timestamp('sentOn').notNullable()
    table.jsonb('payload').notNullable()
    table.index(['conversationId', 'sentOn'])
  }
}
