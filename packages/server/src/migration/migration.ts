import { Knex } from 'knex'

export abstract class Migration {
  protected trx!: Knex.Transaction
  protected isDown!: boolean

  abstract get meta(): MigrationMeta

  async init(trx: Knex.Transaction, isDown: boolean) {
    this.trx = trx
    this.isDown = isDown
  }

  async shouldRun() {
    if (!this.valid()) {
      return false
    }

    if (this.isDown) {
      return this.applied()
    } else {
      return !this.applied()
    }
  }

  async run() {
    if (this.isDown) {
      return this.down()
    } else {
      return this.up()
    }
  }

  protected abstract valid(): Promise<boolean>
  protected abstract applied(): Promise<boolean>
  protected abstract up(): Promise<void>
  protected abstract down(): Promise<void>
}

export interface MigrationMeta {
  name: string
  description: string
  version: string
}
