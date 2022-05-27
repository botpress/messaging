import { Migration } from '@botpress/framework'

export class ProvisionsMigration extends Migration {
  meta = {
    name: `A-${ProvisionsMigration.name}`,
    description: 'Adds msg_provisions table',
    version: '1.1.5'
  }

  async valid() {
    return true
  }

  async applied() {
    return this.trx.schema.hasTable('msg_provisions')
  }

  async up() {
    await this.trx.schema.createTable('msg_provisions', (table) => {
      table.uuid('clientId').unique()
      table.uuid('providerId').unique()
      table.primary(['clientId', 'providerId'])
    })
  }

  async down() {
    await this.trx.schema.dropTable('msg_provisions')
  }
}
