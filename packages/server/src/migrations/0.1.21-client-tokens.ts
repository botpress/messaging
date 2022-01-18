import { getTableId, Migration } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'

export class ClientTokensMigration extends Migration {
  meta = {
    name: ClientTokensMigration.name,
    description: 'Transfers client tokens from msg_clients to a new table msg_client_tokens',
    version: '0.1.21'
  }

  async valid() {
    return this.trx.schema.hasTable(getTableId('msg_clients'))
  }

  async applied() {
    return !(await this.trx.schema.hasColumn(getTableId('msg_clients'), 'token'))
  }

  async up() {
    await this.trx.schema.createTable(getTableId('msg_client_tokens'), (table) => {
      table.uuid('id').primary()
      table.uuid('clientId').references('id').inTable(getTableId('msg_clients'))
      table.string('token').notNullable()
      table.timestamp('expiry').nullable()
    })

    const clients = await this.trx(getTableId('msg_clients'))
    for (const client of clients) {
      await this.trx(getTableId('msg_client_tokens')).insert({ id: uuidv4(), clientId: client.id, token: client.token })
    }

    await this.trx.schema.alterTable(getTableId('msg_clients'), (table) => {
      table.dropColumn('token')
    })
  }

  async down() {
    await this.trx.schema.alterTable(getTableId('msg_clients'), (table) => {
      table.string('token').unique()
    })

    const clients = await this.trx(getTableId('msg_clients'))

    for (const client of clients) {
      const clientTokens = await this.trx(getTableId('msg_client_tokens')).where({ clientId: client.id })
      if (clientTokens.length > 1) {
        this.logger.warn(`Client ${client.id} has more than one token. This may cause unexpected behavior`)
      }

      await this.trx(getTableId('msg_clients')).update({ token: clientTokens[0].token }).where({ id: client.id })
    }

    await this.trx.schema.alterTable(getTableId('msg_clients'), (table) => {
      table.string('token').notNullable().alter()
    })
    await this.trx.schema.dropTable(getTableId('msg_client_tokens'))
  }
}
