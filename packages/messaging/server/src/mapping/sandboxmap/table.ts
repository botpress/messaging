import { Table } from '@botpress/framework'
import { Knex } from 'knex'

export class SandboxmapTable extends Table {
  get name() {
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
