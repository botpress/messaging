import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class UserTable extends Table {
  get name() {
    return 'msg_users'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
  }
}
