import { Migration } from '@botpress/engine'

export class MoveProviderIdMigration extends Migration {
  meta = {
    name: `B-${MoveProviderIdMigration.name}`,
    description: 'Moves provider ids from msg_clients to msg_provisions',
    version: '1.1.5'
  }

  async valid() {
    return (await this.trx.schema.hasTable('msg_clients')) && this.trx.schema.hasTable('msg_provisions')
  }

  async applied() {
    return !(await this.trx.schema.hasColumn('msg_clients', 'providerId'))
  }

  async up() {
    const clients: { id: string; providerId?: string }[] = await this.trx('msg_clients')

    for (const client of clients) {
      if (!client.providerId?.length) {
        continue
      }

      await this.trx('msg_provisions').insert({ clientId: client.id, providerId: client.providerId })
    }

    await this.trx.schema.alterTable('msg_clients', (table) => {
      table.dropColumn('providerId')
    })
  }

  async down() {
    await this.trx.schema.alterTable('msg_clients', (table) => {
      table.uuid('providerId').references('id').inTable('msg_providers').unique().nullable()
    })

    const provisions: { clientId: string; providerId: string }[] = await this.trx('msg_provisions')

    for (const provision of provisions) {
      await this.trx('msg_clients').update({ providerId: provision.providerId }).where({ id: provision.clientId })
    }
  }
}
