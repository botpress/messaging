import { Knex } from 'knex'

export abstract class Migration {
  protected trx!: Knex.Transaction

  abstract get meta(): MigrationMeta

  transact(trx: Knex.Transaction) {
    this.trx = trx
  }

  abstract applied(): Promise<boolean>

  abstract up(): Promise<void>

  abstract down(): Promise<void>
}

export interface MigrationMeta {
  name: string
  description: string
  version: string
}
