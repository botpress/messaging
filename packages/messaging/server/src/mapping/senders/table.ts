import { Table } from '@botpress/framework'
import { Knex } from 'knex'

export class SenderTable extends Table {
  get name() {
    return 'msg_senders'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('identityId').references('id').inTable('msg_identities').notNullable()
    table.string('name').notNullable()
    table.unique(['identityId', 'name'])
  }
}
