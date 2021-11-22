import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ConduitTable extends Table {
  get id() {
    return 'msg_conduits'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable('msg_providers').notNullable()
    table.uuid('channelId').references('id').inTable('msg_channels').notNullable()
    table.timestamp('initialized').nullable()
    table.text('config').notNullable()
    table.unique(['providerId', 'channelId'])
    table.index(['initialized'])
    table.index(['channelId'])
  }
}
