import { Table } from '@botpress/engine'
import { Knex } from 'knex'

export class HouseTable extends Table {
  get name() {
    return 'exa_houses'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
    table.string('address')
  }
}
