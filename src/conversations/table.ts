import { Knex } from 'knex'
import { Table } from '../base/table'

export class ConversationTable extends Table {
  get id(): string {
    return 'conversations'
  }

  create(table: Knex.CreateTableBuilder): void {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('clients')
    table.string('userId')
    table.timestamp('createdOn')
    table.index(['userId', 'clientId'], 'cub_idx')
  }
}
