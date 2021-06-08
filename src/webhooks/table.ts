import { Knex } from 'knex'
import { Table } from '../base/table'

export class WebhookTable extends Table {
  get id() {
    return 'webhooks'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('clients')
  }
}
