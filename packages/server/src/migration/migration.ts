import { Knex } from 'knex'
import { DatabaseService } from '../database/service'

export abstract class Migration {
  protected trx!: Knex.Transaction

  constructor(protected readonly db: DatabaseService) {}

  abstract get meta(): MigrationMeta

  async run(trx: Knex.Transaction) {
    this.trx = trx
    if (await this.applied()) {
      return this.up()
    }
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
