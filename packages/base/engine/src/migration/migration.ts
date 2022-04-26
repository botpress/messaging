import { Knex } from 'knex'
import { Logger } from '..'

export abstract class Migration {
  protected trx!: Knex.Transaction
  protected logger!: Logger
  protected isDown!: boolean
  protected isLite!: boolean

  abstract get meta(): MigrationMeta

  async init(trx: Knex.Transaction, logger: Logger, isDown: boolean, isLite: boolean) {
    this.trx = trx
    this.logger = logger
    this.isDown = isDown
    this.isLite = isLite
  }

  async shouldRun() {
    if (!(await this.valid())) {
      return false
    }

    if (this.isDown) {
      return this.applied()
    } else {
      return !(await this.applied())
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
