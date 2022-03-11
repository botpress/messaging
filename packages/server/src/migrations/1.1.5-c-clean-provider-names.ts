import { getTableId, Migration } from '@botpress/messaging-engine'

export class CleanProviderNamesMigration extends Migration {
  meta = {
    name: `C-${CleanProviderNamesMigration.name}`,
    description: 'Remove names in the msg_providers table that are not necessary',
    version: '1.1.5'
  }

  async valid() {
    return (
      (await this.trx.schema.hasTable(getTableId('msg_providers'))) &&
      this.trx.schema.hasTable(getTableId('msg_provisions'))
    )
  }

  async applied() {
    return this.isDown
  }

  async up() {
    await this.trx.schema.alterTable(getTableId('msg_providers'), (table) => {
      table.string('name').nullable().alter()
    })

    const providers: { id: string; name: string }[] = await this.trx(getTableId('msg_providers'))

    for (const provider of providers) {
      const [provision] = await this.trx(getTableId('msg_provisions')).where({ providerId: provider.id })
      if (!provision) {
        continue
      }

      if (provider.name === provision.clientId) {
        await this.trx(getTableId('msg_providers')).update({ name: null }).where({ id: provider.id })
      }
    }
  }

  async down() {
    const providers: { id: string; name: string }[] = await this.trx(getTableId('msg_providers'))

    for (const provider of providers) {
      if (provider.name?.length) {
        continue
      }

      const [provision] = await this.trx(getTableId('msg_provisions')).where({ providerId: provider.id })

      const name = provision ? provision.clientId : provider.id
      await this.trx(getTableId('msg_providers')).update({ name }).where({ id: provider.id })
    }

    await this.trx.schema.alterTable(getTableId('msg_providers'), (table) => {
      table.string('name').notNullable().alter()
    })
  }
}
