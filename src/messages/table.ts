import { Knex } from 'knex'
import { Table } from '../base/table'

export class MessageTable extends Table {
  get id() {
    return 'msg_messages'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('conversationId').references('id').inTable('msg_conversations').notNullable().onDelete('cascade')
    table.string('authorId').references('id').inTable('msg_users').nullable()
    table.timestamp('sentOn').notNullable()
    table.jsonb('payload').notNullable()
    table.index(['conversationId', 'sentOn'])
  }
}
