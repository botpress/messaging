import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class HouseTable extends Table {
  get name() {
    return 'exa_houses'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
    table.string('address')
  }
}
