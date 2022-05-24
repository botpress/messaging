import { Table } from '@botpress/engine'
import { Knex } from 'knex'

export class WebhookTable extends Table {
  get name() {
    return 'msg_webhooks'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
    table.string('url').notNullable()
    table.string('token').notNullable()
  }
}
