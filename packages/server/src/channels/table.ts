import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ChannelTable extends Table {
  get name() {
    return 'msg_channels'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('version').notNullable()
    table.boolean('lazy').notNullable()
    table.boolean('initiable').notNullable()
    table.unique(['name', 'version'])
  }
}
