import { BatchingService } from './batching/service'
import { CachingService } from './caching/service'
import { CryptoService } from './crypto/service'
import { DatabaseService } from './database/service'
import { DistributedService } from './distributed/service'
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
  caching: CachingService
  batching: BatchingService

  constructor() {
    this.logger = new LoggerService()
    this.database = new DatabaseService()
    this.meta = new MetaService(this.database)
    this.migration = new MigrationService(this.database, this.meta)
    this.crypto = new CryptoService()
    this.distributed = new DistributedService()
    this.caching = new CachingService(this.distributed)
    this.batching = new BatchingService()
  }

  async setup() {
    await this.logger.setup()
    await this.database.setup()
    await this.meta.setup()
    await this.migration.setup()
    await this.crypto.setup()
    await this.distributed.setup()
    await this.caching.setup()
    await this.batching.setup()
  }
}
