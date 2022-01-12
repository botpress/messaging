import { DispatchService } from '.'
import { BarrierService } from './barrier/service'
import { BatchingService } from './batching/service'
import { CachingService } from './caching/service'
import { CryptoService } from './crypto/service'
import { DatabaseService } from './database/service'
import { DistributedService } from './distributed/service'
import { KvsService } from './kvs/service'
import { LoggerService } from './logger/service'
import { MetaService } from './meta/service'
import { MigrationService } from './migration/service'

export class Engine {
  logger: LoggerService
  database: DatabaseService
  meta: MetaService
  migration: MigrationService
  crypto: CryptoService
  distributed: DistributedService
  dispatches: DispatchService
  caching: CachingService
  batching: BatchingService
  barriers: BarrierService
  kvs: KvsService

  constructor() {
    this.logger = new LoggerService()
    this.database = new DatabaseService()
    this.meta = new MetaService(this.database)
    this.migration = new MigrationService(this.database, this.meta)
    this.crypto = new CryptoService()
    this.distributed = new DistributedService()
    this.dispatches = new DispatchService(this.distributed)
    this.caching = new CachingService(this.distributed)
    this.batching = new BatchingService()
    this.barriers = new BarrierService(this.caching)
    this.kvs = new KvsService(this.database, this.caching)
  }

  async setup() {
    await this.logger.setup()
    await this.database.setup()
    await this.meta.setup()
    await this.migration.setup()
    await this.crypto.setup()
    await this.distributed.setup()
    await this.dispatches.setup()
    await this.caching.setup()
    await this.batching.setup()
    await this.barriers.setup()
    await this.kvs.setup()
  }

  async postSetup() {
    const trx = await this.database.knex.transaction()
    await this.database.createTables(trx)
    await this.meta.update(this.meta.app(), trx)
    await trx.commit()
  }
}
