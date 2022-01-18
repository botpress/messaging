import { getTableId, Migration } from '@botpress/messaging-engine'

export class FixClientSchemaMigration extends Migration {
  meta = {
    name: FixClientSchemaMigration.name,
    description: 'Fixes broken msg_clients table schema',
    version: '0.1.20'
  }

  async valid() {
    return this.trx.schema.hasTable(getTableId('msg_clients'))
  }

  async applied() {
    return false
  }

  async up() {
    return this.trx.schema.alterTable(getTableId('msg_clients'), (table) => {
      table.uuid('providerId').nullable().alter()
    })
  }

  async down() {}
}
