import { Knex } from 'knex'
import { Table } from '../../base/table'

export class TunnelTable extends Table {
  get id() {
    return 'msg_tunnels'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients')
    table.uuid('channelId').references('id').inTable('msg_channels')
    table.unique(['clientId', 'channelId'])
  }
}
