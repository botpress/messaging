import { getTableId, Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class SandboxmapTable extends Table {
  get name() {
    return 'msg_sandboxmap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('conduitId').references('id').inTable(getTableId('msg_conduits')).notNullable()
    table.string('identity').notNullable()
    table.string('sender').notNullable()
    table.string('thread').notNullable()
    table.uuid('clientId').references('id').inTable(getTableId('msg_clients')).notNullable()
    table.primary(['conduitId', 'identity', 'sender', 'thread'])
  }
}
