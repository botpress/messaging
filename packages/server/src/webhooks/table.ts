import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class WebhookTable extends Table {
  get name() {
    return 'msg_webhooks'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
    table.string('url').notNullable()
    table.string('token').notNullable()
  }
}
