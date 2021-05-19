import { Knex } from 'knex'
import { Table } from '../base/table'

export class ConversationTable extends Table {
  get id(): string {
    return 'conversations'
  }

  create(table: Knex.CreateTableBuilder): void {
    table.uuid('id').primary()
    table.string('userId')
    table.string('botId')
    table.timestamp('createdOn')
    table.index(['userId', 'botId'], 'cub_idx')
  }
}
