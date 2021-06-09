import { Knex } from 'knex'
import { Table } from '../base/table'

export class ConduitTable extends Table {
  get id() {
    return 'conduits'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable('providers')
    table.uuid('channelId').references('id').inTable('channels')
    table.text('config')
    table.unique(['providerId', 'channelId'])
  }
}
