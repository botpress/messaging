import { Migration } from '../migration'

export class UserTokenMigration extends Migration {
  meta = {
    name: UserTokenMigration.name,
    description: 'Adds token column to the msg_users table',
    version: '0.2.0'
  }

  async valid() {
    return this.trx.schema.hasTable('msg_users')
  }

  async applied() {
    return this.trx.schema.hasColumn('msg_users', 'token')
  }

  async up() {
    return this.trx.schema.alterTable('msg_users', (table) => {
      table.string('token')
    })
  }

  async down() {
    return this.trx.schema.alterTable('msg_users', (table) => {
      table.dropColumn('token')
    })
  }
}
