import { Knex } from 'knex'
import { Table } from '../../base/table'

export class UsermapTable extends Table {
  get id() {
    return 'msg_usermap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('tunnelId').references('id').inTable('msg_tunnels')
    table.uuid('userId').references('id').inTable('msg_users')
    table.uuid('senderId').references('id').inTable('msg_senders')
    table.unique(['tunnelId', 'userId'])
    table.unique(['tunnelId', 'senderId'])
  }
}
