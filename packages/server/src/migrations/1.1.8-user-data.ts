import { Migration } from '@botpress/messaging-engine'

export class UserDataMigration extends Migration {
  meta = {
    name: UserDataMigration.name,
    description: 'Modifies the msg_users table to add data',
    version: '1.2.8'
  }

  async valid() {
    return true
  }

  async applied() {
    return this.trx.schema.hasColumn('msg_users', 'data')
  }

  async up() {
    await this.trx.schema.alterTable('msg_users', (table) => {
      table.jsonb('data').nullable()
    })
  }

  async down() {
    await this.trx.schema.alterTable('msg_users', (table) => {
      table.dropColumn('data')
    })
  }
}
