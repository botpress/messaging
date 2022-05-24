import { Table } from '@botpress/engine'
import { Knex } from 'knex'

export class StatusTable extends Table {
  get name() {
    return 'msg_status'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('conduitId').primary().references('id').inTable('msg_conduits').onDelete('cascade')
    table.integer('numberOfErrors').notNullable()
    table.timestamp('initializedOn').nullable()
    table.text('lastError').nullable()
    table.index(['numberOfErrors', 'initializedOn'])
  }
}
