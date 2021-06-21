import { Knex } from 'knex'
import { Table } from '../../base/table'

export class IdentityTable extends Table {
  get id() {
    return 'msg_identities'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('tunnelId').references('id').inTable('msg_tunnels')
    table.string('name')
    table.unique(['tunnelId', 'name'])
  }
}
