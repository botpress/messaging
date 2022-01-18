import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ClientTable extends Table {
  get name() {
    return 'msg_clients'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable(getTableId('msg_providers')).unique().nullable()
  }
}
