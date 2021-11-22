import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class UserTable extends Table {
  get id() {
    return 'msg_users'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
  }
}
