import { Migration } from '@botpress/messaging-engine'

export class StatusMigration extends Migration {
  meta = {
    name: StatusMigration.name,
    description: 'Moves status information from conduit table to the status table',
    version: '0.1.19'
  }

  async valid() {
    return this.trx.schema.hasTable('msg_conduits')
  }

  async applied() {
    return !(await this.trx.schema.hasColumn('msg_conduits', 'initialized'))
  }

  async up() {
    await this.trx.schema.dropTableIfExists('msg_status')

    return this.trx.schema.alterTable('msg_conduits', (table) => {
      table.dropIndex(['initialized'])
      table.dropColumn('initialized')
    })
  }

  async down() {
    await this.trx.schema.dropTableIfExists('msg_status')

    return this.trx.schema.alterTable('msg_conduits', (table) => {
      table.timestamp('initialized').nullable()
      table.index(['initialized'])
    })
  }
}
