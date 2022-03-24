import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class TunnelTable extends Table {
  get name() {
    return 'msg_tunnels'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
    table.uuid('channelId').references('id').inTable(getTableId('msg_channels')).nullable()
    table.string('customChannelName').nullable()
    table.unique(['clientId', 'channelId'])
    table.unique(['clientId', 'customChannelName'])
  }
}
