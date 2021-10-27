import { Knex } from 'knex'
import { Table } from '../base/table'

export class UserTokenTable extends Table {
  get id() {
    return 'msg_user_tokens'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('userId').references('id').inTable('msg_users')
    table.string('token').notNullable()
    table.timestamp('expiry').nullable()
  }
}
