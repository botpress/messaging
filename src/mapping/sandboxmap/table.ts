import { Knex } from 'knex'
import { Table } from '../../base/table'

export class SandboxmapTable extends Table {
  get id() {
    return 'msg_sandboxmap'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('conduitId').references('id').inTable('msg_conduits').notNullable()
    table.string('identity').notNullable()
    table.string('sender').notNullable()
    table.string('thread').notNullable()
    table.uuid('clientId').references('id').inTable('msg_clients').notNullable()
    table.primary(['conduitId', 'identity', 'sender', 'thread'])
  }
}
