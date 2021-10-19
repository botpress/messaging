import { BatchingService } from './batching/service'
import { CachingService } from './caching/service'
import { CryptoService } from './crypto/service'
import { DatabaseService } from './database/service'
import { DistributedService } from './distributed/service'
import { KvsService } from './kvs/service'
import { LoggerService } from './logger/service'

export class Engine {
  logger: LoggerService
  database: DatabaseService
  crypto: CryptoService
  distributed: DistributedService
  caching: CachingService
  batching: BatchingService
  kvs: KvsService

  constructor() {
    this.logger = new LoggerService()
    this.database = new DatabaseService()
    this.crypto = new CryptoService()
    this.distributed = new DistributedService()
    this.caching = new CachingService(this.distributed)
    this.batching = new BatchingService()
    this.kvs = new KvsService(this.database, this.caching)
  }

  async setup() {
    await this.logger.setup()
    await this.database.setup()
    await this.crypto.setup()
    await this.distributed.setup()
    await this.caching.setup()
    await this.batching.setup()
    await this.kvs.setup()
  }
}
