import { Knex } from 'knex'
import { Table } from '../base/table'

export class WebhookTable extends Table {
  get id() {
    return 'msg_webhooks'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
    table.string('url').notNullable()
    table.string('token').notNullable()
  }
}
