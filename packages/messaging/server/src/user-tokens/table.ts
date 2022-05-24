import { Table } from '@botpress/engine'
import { Knex } from 'knex'

export class UserTokenTable extends Table {
  get name() {
    return 'msg_user_tokens'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('userId').references('id').inTable('msg_users')
    table.string('token').notNullable()
    table.timestamp('expiry').nullable()
  }
}
