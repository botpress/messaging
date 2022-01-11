import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ClientTable extends Table {
  get id() {
    return 'msg_clients'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable('msg_providers').unique().nullable()
  }
}
