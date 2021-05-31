import { Knex } from 'knex'
import { Table } from '../base/table'

export class MessageTable extends Table {
  get id() {
    return 'messages'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('conversationId').references('id').inTable('conversations').notNullable().onDelete('cascade')
    table.string('authorId')
    table.timestamp('sentOn')
    table.jsonb('payload')
    table.index(['conversationId', 'sentOn'])
  }
}
