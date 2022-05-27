import { Table } from '@botpress/framework'
import { Knex } from 'knex'

export class UserTable extends Table {
  get name() {
    return 'msg_users'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
  }
}
