import { Table } from '@botpress/engine'
import { Knex } from 'knex'

export class ClientTable extends Table {
  get name() {
    return 'msg_clients'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
  }
}
