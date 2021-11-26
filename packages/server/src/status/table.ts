import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class StatusTable extends Table {
  get id() {
    return 'msg_status'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('conduitId').primary().references('id').inTable('msg_conduits').onDelete('cascade')
    table.integer('numberOfErrors').defaultTo(0)
    table.timestamp('initializedOn').nullable()
    table.text('lastError').nullable()
    table.index(['numberOfErrors', 'initializedOn'])
  }
}
