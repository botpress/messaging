import { Table } from '@botpress/framework'
import { Knex } from 'knex'

export class UsermapTable extends Table {
  get name() {
    return 'msg_usermap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('tunnelId').references('id').inTable('msg_tunnels').notNullable()
    table.uuid('userId').references('id').inTable('msg_users').notNullable()
    table.uuid('senderId').references('id').inTable('msg_senders').notNullable()
    // TODO: remove this constraint
    table.unique(['tunnelId', 'userId'])
    table.unique(['tunnelId', 'senderId'])
  }
}
