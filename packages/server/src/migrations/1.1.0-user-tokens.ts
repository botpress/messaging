import { getTableId, Migration } from '@botpress/messaging-engine'

export class UserTokensMigration extends Migration {
  meta = {
    name: UserTokensMigration.name,
    description: 'Adds msg_user_tokens table',
    version: '1.1.0'
  }

  async valid() {
    return true
  }

  async applied() {
    return this.trx.schema.hasTable(getTableId('msg_user_tokens'))
  }

  async up() {
    // since it was possible to have this table created in the past with an experimental option, we delete it here
    await this.trx.schema.dropTableIfExists(getTableId('msg_user_tokens'))

    await this.trx.schema.createTable(getTableId('msg_user_tokens'), (table) => {
      table.uuid('id').primary()
      table.uuid('userId').references('id').inTable(getTableId('msg_users'))
      table.string('token').notNullable()
      table.timestamp('expiry').nullable()
    })
  }

  async down() {
    await this.trx.schema.dropTable(getTableId('msg_user_tokens'))
  }
}
