import { getTableId, Migration } from '@botpress/messaging-engine'

export class ChannelVersionsMigration extends Migration {
  meta = {
    name: ChannelVersionsMigration.name,
    description: 'Adds a version column to the msg_channels table',
    version: '1.0.2'
  }

  async valid() {
    return this.trx.schema.hasTable(getTableId('msg_channels'))
  }

  async applied() {
    return this.trx.schema.hasColumn(getTableId('msg_channels'), 'version')
  }

  async up() {
    await this.trx.schema.alterTable(getTableId('msg_channels'), (table) => {
      table.dropUnique(['name'])
      table.string('version').nullable()
      table.unique(['name', 'version'])
    })

    const channels: { id: string; name: string }[] = await this.trx(getTableId('msg_channels'))

    for (const channel of channels) {
      if (channel.name.includes('@')) {
        const [name, version] = channel.name.split('@')
        await this.trx(getTableId('msg_channels')).update({ name, version }).where({ id: channel.id })
      } else {
        await this.trx(getTableId('msg_channels')).update({ version: '0.1.0' }).where({ id: channel.id })
      }
    }

    await this.trx.schema.alterTable(getTableId('msg_channels'), (table) => {
      table.string('version').notNullable().alter()
    })
  }

  async down() {
    const newChannels: { id: string; name: string; version: string }[] = await this.trx(
      getTableId('msg_channels')
    ).whereNot({
      version: '0.1.0'
    })

    for (const newChannel of newChannels) {
      await this.trx(getTableId('msg_channels'))
        .update({ name: `${newChannel.name}@${newChannel.version}` })
        .where({ id: newChannel.id })
    }

    await this.trx.schema.alterTable(getTableId('msg_channels'), (table) => {
      table.dropUnique(['name', 'version'])
      table.dropColumn('version')
      table.unique(['name'])
    })
  }
}
