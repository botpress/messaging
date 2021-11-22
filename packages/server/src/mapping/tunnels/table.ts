import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class TunnelTable extends Table {
  get id() {
    return 'msg_tunnels'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
    table.uuid('channelId').references('id').inTable('msg_channels').notNullable()
    table.unique(['clientId', 'channelId'])
  }
}
