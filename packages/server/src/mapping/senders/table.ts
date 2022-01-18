import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class SenderTable extends Table {
  get name() {
    return 'msg_senders'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('identityId').references('id').inTable(getTableId('msg_identities')).notNullable()
    table.string('name').notNullable()
    table.unique(['identityId', 'name'])
  }
}
