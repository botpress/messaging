import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class StatusTable extends Table {
  get name() {
    return 'msg_status'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('conduitId').primary().references('id').inTable(getTableId('msg_conduits')).onDelete('cascade')
    table.integer('numberOfErrors').notNullable()
    table.timestamp('initializedOn').nullable()
    table.text('lastError').nullable()
    table.index(['numberOfErrors', 'initializedOn'])
  }
}
