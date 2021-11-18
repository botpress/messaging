import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, ServerCache, ServerCache2D, Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { Batcher } from '../../batching/batcher'
import { BatchingService } from '../../batching/service'
import { SenderTable } from './table'
import { Sender } from './types'

export class SenderService extends Service {
  private table: SenderTable
  private cacheById!: ServerCache<uuid, Sender>
  private cacheByName!: ServerCache2D<Sender>
  public batcher!: Batcher<Sender>

  constructor(private db: DatabaseService, private caching: CachingService, private batching: BatchingService) {
    super()
    this.table = new SenderTable()
  }

  async setup() {
    this.cacheById = await this.caching.newServerCache('cache_sender_by_id')
    this.cacheByName = await this.caching.newServerCache2D('cache_sender_by_name')

    this.batcher = await this.batching.newBatcher('batcher_sender', [], this.handleBatchFlush.bind(this))

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: Sender[]) {
    await this.query().insert(batch)
  }

  async get(id: uuid): Promise<Sender | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ id })

    if (rows?.length) {
      const sender = rows[0] as Sender
      this.cacheById.set(id, sender)
      return sender
    } else {
      return undefined
    }
  }

  async map(identityId: uuid, name: string): Promise<Sender> {
    const cached = this.cacheByName.get(identityId, name)
    if (cached) {
      return cached
    }

    await this.batcher.flush()
    const rows = await this.query().where({ identityId, name })

    if (rows?.length) {
      const sender = rows[0] as Sender
      this.cacheByName.set(identityId, name, sender)
      return sender
    } else {
      const sender = {
        id: uuidv4(),
        identityId,
        name
      }

      await this.batcher.push(sender)
      this.cacheByName.set(identityId, name, sender)
      this.cacheById.set(sender.id, sender)

      return sender
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
