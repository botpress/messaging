import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ProviderTable extends Table {
  get name() {
    return 'msg_providers'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('name').unique().notNullable()
    table.boolean('sandbox').notNullable()
  }
}
