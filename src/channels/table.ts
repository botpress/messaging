import { Knex } from 'knex'
import { Table } from '../base/table'

export class ChannelTable extends Table {
  get id() {
    return 'msg_channels'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('name').unique()
    table.boolean('lazy')
    table.boolean('initable')
  }
}
