import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache2D } from '../caching/cache2D'
import { CachingService } from '../caching/service'
import { CryptoService } from '../crypto/service'
import { DatabaseService } from '../database/service'
import { ConduitEmitter, ConduitEvents, ConduitWatcher } from './events'
import { ConduitTable } from './table'
import { Conduit } from './types'

export class ConduitService extends Service {
  public events(): ConduitWatcher {
    return this.emitter
  }

  private emitter: ConduitEmitter
  private table: ConduitTable
  private cache!: ServerCache2D<Conduit>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService
  ) {
    super()
    this.emitter = new ConduitEmitter()
    this.table = new ConduitTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache2D('cache_conduit_by_id')

    await this.db.registerTable(this.table)
  }

  async create(providerId: uuid, channelId: uuid, config: any): Promise<Conduit> {
    return this.query().insert(await this.serialize({ id: uuidv4(), providerId, channelId, config }))
  }

  async delete(providerId: uuid, channelId: uuid) {
    this.cache.del(providerId, channelId)
    await this.emitter.emit(ConduitEvents.Deleting, { providerId, channelId })

    return this.query().where({ providerId, channelId }).del()
  }

  async updateConfig(providerId: uuid, channelId: uuid, config: any) {
    this.cache.del(providerId, channelId)
    await this.emitter.emit(ConduitEvents.Updating, { providerId, channelId })

    return this.query()
      .where({ providerId, channelId })
      .update({ config: await this.cryptoService.encrypt(JSON.stringify(config || {})) })
  }

  async get(providerId: uuid, channelId: uuid): Promise<Conduit | undefined> {
    const cached = this.cache.get(providerId, channelId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ providerId, channelId })
    if (rows?.length) {
      const conduit = await this.deserialize(rows[0])
      this.cache.set(providerId, channelId, conduit)
      return conduit
    }

    return undefined
  }

  async list(providerId: uuid): Promise<Conduit[]> {
    const rows = await this.query().where({ providerId })
    return rows.map((x) => _.omit(x, 'config')) as Conduit[]
  }

  private async serialize(conduit: Partial<Conduit>) {
    return {
      ...conduit,
      config: await this.cryptoService.encrypt(JSON.stringify(conduit.config || {}))
    }
  }

  private async deserialize(conduit: any): Promise<Conduit> {
    return {
      ...conduit,
      config: JSON.parse(await this.cryptoService.decrypt(conduit.config))
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
