import { Knex } from 'knex'
import { Table } from '../../base/table'

export class SenderTable extends Table {
  get id() {
    return 'msg_senders'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('identityId').references('id').inTable('msg_identities').notNullable()
    table.string('name').notNullable()
    table.unique(['identityId', 'name'])
  }
}
