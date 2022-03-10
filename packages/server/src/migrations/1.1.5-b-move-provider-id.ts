import { getTableId, Migration } from '@botpress/messaging-engine'

export class MoveProviderIdMigration extends Migration {
  meta = {
    name: `B-${MoveProviderIdMigration.name}`,
    description: 'Moves provider ids from msg_clients to msg_provisions',
    version: '1.1.5'
  }

  async valid() {
    return (
      (await this.trx.schema.hasTable(getTableId('msg_clients'))) &&
      this.trx.schema.hasTable(getTableId('msg_provisions'))
    )
  }

  async applied() {
    return !(await this.trx.schema.hasColumn(getTableId('msg_clients'), 'providerId'))
  }

  async up() {
    const clients: { id: string; providerId?: string }[] = await this.trx(getTableId('msg_clients'))

    for (const client of clients) {
      if (!client.providerId?.length) {
        continue
      }

      await this.trx(getTableId('msg_provisions')).insert({ clientId: client.id, providerId: client.providerId })
    }

    await this.trx.schema.alterTable(getTableId('msg_clients'), (table) => {
      table.dropColumn('providerId')
    })
  }

  async down() {
    await this.trx.schema.alterTable(getTableId('msg_clients'), (table) => {
      table.uuid('providerId').references('id').inTable(getTableId('msg_providers')).unique().nullable()
    })

    const provisions: { clientId: string; providerId: string }[] = await this.trx(getTableId('msg_provisions'))

    for (const provision of provisions) {
      await this.trx(getTableId('msg_clients'))
        .update({ providerId: provision.providerId })
        .where({ id: provision.clientId })
    }
  }
}
