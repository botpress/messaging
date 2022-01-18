import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ClientTokenTable extends Table {
  get name() {
    return 'msg_client_tokens'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable(getTableId('msg_clients'))
    table.string('token').notNullable()
    table.timestamp('expiry').nullable()
  }
}
