import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ChannelService } from '../channels/service'
import { ConfigService } from '../config/service'
import { CryptoService } from '../crypto/service'
import { DatabaseService } from '../database/service'
import { ProviderService } from '../providers/service'
import { ConduitEmitter, ConduitEvents, ConduitWatcher } from './events'
import { ConduitTable } from './table'
import { Conduit } from './types'

export class ConduitService extends Service {
  public events(): ConduitWatcher {
    return this.emitter
  }

  private emitter: ConduitEmitter
  private table: ConduitTable
  private cache!: ServerCache<string, Conduit>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private configService: ConfigService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService
  ) {
    super()
    this.emitter = new ConduitEmitter()
    this.table = new ConduitTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_conduit_by_id')

    await this.db.registerTable(this.table)

    for (const config of this.configService.current.providers || []) {
      const provider = (await this.providerService.getByName(config.name))!

      for (const channelName of Object.keys(config.channels)) {
        const channel = this.channelService.getByName(channelName)
        const conduitConfig = config.channels[channelName]

        if (!(await this.get(provider.id, channel.id))) {
          await this.create(provider.id, channel.id, conduitConfig)
        }
      }
    }
  }

  async create(providerId: uuid, channelId: uuid, config: any): Promise<Conduit> {
    return this.query().insert(await this.serialize({ id: uuidv4(), providerId, channelId, config }))
  }

  async delete(providerId: uuid, channelId: uuid) {
    this.cache.del(this.getCacheKey(providerId, channelId))
    await this.emitter.emit(ConduitEvents.Deleting, { providerId, channelId })

    return this.query().where({ providerId, channelId }).del()
  }

  async updateConfig(providerId: uuid, channelId: uuid, config: any) {
    this.cache.del(this.getCacheKey(providerId, channelId))
    await this.emitter.emit(ConduitEvents.Updating, { providerId, channelId })

    return this.query()
      .where({ providerId, channelId })
      .update({ config: await this.cryptoService.encrypt(JSON.stringify(config || {})) })
  }

  async get(providerId: uuid, channelId: uuid): Promise<Conduit | undefined> {
    const key = this.getCacheKey(providerId, channelId)
    const cached = this.cache.get(key)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ providerId, channelId })
    if (rows?.length) {
      const conduit = await this.deserialize(rows[0])
      this.cache.set(key, conduit)
      return conduit
    }

    return undefined
  }

  async list(providerId: uuid): Promise<Conduit[]> {
    const rows = await this.query().where({ providerId })
    return rows.map((x) => _.omit(x, 'config')) as Conduit[]
  }

  private getCacheKey(providerId: uuid, channelId: uuid) {
    return `${providerId}-${channelId}`
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
