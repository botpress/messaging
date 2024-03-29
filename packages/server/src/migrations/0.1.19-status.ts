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
    // we don't care about losing data that was in this table
    await this.trx.schema.dropTable('msg_status')

    await this.trx.schema.createTable('msg_status', (table) => {
      table.uuid('conduitId').primary().references('id').inTable('msg_conduits').onDelete('cascade')
      table.integer('numberOfErrors').notNullable()
      table.timestamp('initializedOn').nullable()
      table.text('lastError').nullable()
      table.index(['numberOfErrors', 'initializedOn'])
    })

    return this.trx.schema.alterTable('msg_conduits', (table) => {
      table.dropIndex(['initialized'])
      table.dropColumn('initialized')
    })
  }

  async down() {
    // we don't care about losing data that was in this table
    await this.trx.schema.dropTable('msg_status')

    await this.trx.schema.createTable('msg_status', (table) => {
      table.uuid('conduitId').primary().references('id').inTable('msg_conduits').onDelete('cascade')
      table.integer('numberOfErrors').defaultTo(0)
      table.text('lastError')
    })

    return this.trx.schema.alterTable('msg_conduits', (table) => {
      table.timestamp('initialized').nullable()
      table.index(['initialized'])
    })
  }
}
