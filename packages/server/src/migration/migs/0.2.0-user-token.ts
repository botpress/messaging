import { Migration } from '../migration'

export class UserTokenMigration extends Migration {
  meta = {
    name: UserTokenMigration.name,
    description: 'Adds token column to the msg_users table',
    version: '0.2.0'
  }

  async up() {}

  async down() {}
}
