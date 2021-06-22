import { Knex } from 'knex'
import { Table } from '../../base/table'

export class SandboxmapTable extends Table {
  get id() {
    return 'msg_sandboxmap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('conduitId').references('id').inTable('msg_conduits')
    table.string('identity')
    table.string('sender')
    table.string('thread')
    table.uuid('clientId').references('id').inTable('msg_clients')
    table.primary(['conduitId', 'identity', 'sender', 'thread'])
  }
}
