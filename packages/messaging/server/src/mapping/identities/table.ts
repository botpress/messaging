import { Table } from '@botpress/framework'
import { Knex } from 'knex'

export class IdentityTable extends Table {
  get name() {
    return 'msg_identities'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('tunnelId').references('id').inTable('msg_tunnels').notNullable()
    table.string('name').notNullable()
    table.unique(['tunnelId', 'name'])
  }
}
