import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class UserTokenTable extends Table {
  get name() {
    return 'msg_user_tokens'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('userId').references('id').inTable(getTableId('msg_users'))
    table.string('token').notNullable()
    table.timestamp('expiry').nullable()
  }
}
