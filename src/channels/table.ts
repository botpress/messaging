import { Knex } from 'knex'
import { Table } from '../base/table'

export class ChannelTable extends Table {
  get id() {
    return 'msg_channels'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('name').unique().notNullable()
    table.boolean('lazy').notNullable()
    table.boolean('initiable').notNullable()
  }
}
