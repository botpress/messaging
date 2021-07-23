import { Knex } from 'knex'
import { Table } from '../../base/table'

export class IdentityTable extends Table {
  get id() {
    return 'msg_identities'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('tunnelId').references('id').inTable('msg_tunnels').notNullable()
    table.string('name').notNullable()
    table.unique(['tunnelId', 'name'])
  }
}
