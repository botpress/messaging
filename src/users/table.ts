import { Knex } from 'knex'
import { Table } from '../base/table'

export class UserTable extends Table {
  get id() {
    return 'msg_users'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients')
  }
}
