import { Knex } from 'knex'
import { Table } from '../base/table'

export class HealthTable extends Table {
  get id() {
    return 'msg_health'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('conduitId').references('id').inTable('msg_conduits').notNullable().onDelete('cascade')
    table.timestamp('time').notNullable()
    table.string('type').notNullable()
    table.jsonb('data').nullable()
    table.index(['conduitId', 'time'])
  }
}
