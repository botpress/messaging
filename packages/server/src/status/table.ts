import { Knex } from 'knex'
import { Table } from '../base/table'

export class StatusTable extends Table {
  get id() {
    return 'msg_status'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('conduitId').references('id').inTable('msg_conduits').notNullable().onDelete('cascade')
    table.integer('numberOfErrors').defaultTo(0)
    table.text('lastError')
    table.index(['conduitId'])
  }
}
