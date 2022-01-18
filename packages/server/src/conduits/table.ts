import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ConduitTable extends Table {
  get name() {
    return 'msg_conduits'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable(getTableId('msg_providers')).notNullable()
    table.uuid('channelId').references('id').inTable(getTableId('msg_channels')).notNullable()
    table.text('config').notNullable()
    table.unique(['providerId', 'channelId'])
    table.index(['channelId'])
  }
}
