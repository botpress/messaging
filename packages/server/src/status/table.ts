import { Knex } from 'knex'
import { Table } from '../base/table'

export class StatusTable extends Table {
  get id() {
    return 'msg_status'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('conduitId').primary().references('id').inTable('msg_conduits').onDelete('cascade')
    table.integer('numberOfErrors').defaultTo(0)
    table.text('lastError')
  }
}
