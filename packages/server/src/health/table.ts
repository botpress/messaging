import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class HealthTable extends Table {
  get name() {
    return 'msg_health'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('conduitId').references('id').inTable(getTableId('msg_conduits')).notNullable().onDelete('cascade')
    table.timestamp('time').notNullable()
    table.string('type').notNullable()
    table.jsonb('data').nullable()
    table.index(['conduitId', 'time'])
  }
}
