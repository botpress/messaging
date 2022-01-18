import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class UsermapTable extends Table {
  get name() {
    return 'msg_usermap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('tunnelId').references('id').inTable(getTableId('msg_tunnels')).notNullable()
    table.uuid('userId').references('id').inTable(getTableId('msg_users')).notNullable()
    table.uuid('senderId').references('id').inTable(getTableId('msg_senders')).notNullable()
    // TODO: remove this constraint
    table.unique(['tunnelId', 'userId'])
    table.unique(['tunnelId', 'senderId'])
  }
}
