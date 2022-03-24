import { getTableId, Migration } from '@botpress/messaging-engine'

export class CustomChannelsMigration extends Migration {
  meta = {
    name: CustomChannelsMigration.name,
    description: 'Modifies the msg_tunnels table to support custom channels',
    version: '1.1.7'
  }

  async valid() {
    return true
  }

  async applied() {
    return this.trx.schema.hasColumn(getTableId('msg_tunnels'), 'customChannelName')
  }

  async up() {
    await this.trx.schema.alterTable(getTableId('msg_tunnels'), (table) => {
      table.uuid('channelId').nullable().alter()
      table.string('customChannelName').nullable()
      table.unique(['clientId', 'customChannelName'])
    })
  }

  async down() {
    await this.trx(getTableId('msg_tunnels')).whereNull('channelId').del()

    await this.trx.schema.alterTable(getTableId('msg_tunnels'), (table) => {
      table.uuid('channelId').notNullable().alter()
      table.dropUnique(['clientId', 'customChannelName'])
      table.dropColumn('customChannelName')
    })
  }
}
