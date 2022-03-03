import { Table } from '@botpress/messaging-engine'
import { Knex } from 'knex'

export class ProvisionTable extends Table {
  get name() {
    return 'msg_provisions'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('clientId').unique()
    table.uuid('providerId').unique()
    table.primary(['clientId', 'providerId'])
  }
}
