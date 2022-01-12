import { Migration } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'

export class ClientTokensMigration extends Migration {
  meta = {
    name: ClientTokensMigration.name,
    description: 'Removes the token field from the msg_clients table',
    version: '0.1.21'
  }

  async valid() {
    return this.trx.schema.hasTable('msg_clients')
  }

  async applied() {
    return !this.trx.schema.hasColumn('msg_clients', 'token')
  }

  async up() {
    const clients = await this.trx('msg_clients')

    for (const client of clients) {
      await this.trx('msg_client_tokens').insert({ id: uuidv4(), clientId: client.id, token: client.token })
    }

    await this.trx.schema.alterTable('msg_clients', (table) => {
      table.dropColumn('token')
    })
  }

  async down() {}
}
