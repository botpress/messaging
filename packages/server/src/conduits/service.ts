import { uuid } from '@botpress/messaging-base'
import { CryptoService, DatabaseService, Service } from '@botpress/messaging-engine'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { ServerCache } from '../caching/cache'
import { ServerCache2D } from '../caching/cache2D'
import { CachingService } from '../caching/service'
import { ChannelService } from '../channels/service'
import { ProviderDeletingEvent, ProviderEvents } from '../providers/events'
import { ProviderService } from '../providers/service'
import { ConduitEmitter, ConduitEvents, ConduitWatcher } from './events'
import { ConduitTable } from './table'
import { Conduit } from './types'

export class ConduitService extends Service {
  get events(): ConduitWatcher {
    return this.emitter
  }

  private emitter: ConduitEmitter
  private table: ConduitTable
  private cacheById!: ServerCache<uuid, Conduit>
  private cacheByProviderAndChannel!: ServerCache2D<Conduit>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService
  ) {
    super()
    this.emitter = new ConduitEmitter()
    this.table = new ConduitTable()
  }

  async setup() {
    this.cacheById = await this.cachingService.newServerCache('cache_conduit_by_id')
    this.cacheByProviderAndChannel = await this.cachingService.newServerCache2D('cache_conduit_by_provider_and_channel')

    await this.db.registerTable(this.table)

    this.providerService.events.on(ProviderEvents.Deleting, this.onProviderDeleting.bind(this))
  }

  async create(providerId: uuid, channelId: uuid, config: any): Promise<Conduit> {
    const channel = this.channelService.getById(channelId)
    const validConfig = await channel.schema.validateAsync(config)

    const conduit = {
      id: uuidv4(),
      providerId,
      channelId,
      config: validConfig,
      initialized: undefined
    }

    await this.query().insert(this.serialize(conduit))
    await this.emitter.emit(ConduitEvents.Created, conduit.id)

    return conduit
  }

  async delete(id: uuid) {
    const conduit = (await this.get(id))!
    this.cacheById.del(id, true)
    this.cacheByProviderAndChannel.del(conduit.providerId, conduit.channelId, true)

    await this.emitter.emit(ConduitEvents.Deleting, id)

    return this.query().where({ id }).del()
  }

  async updateConfig(id: uuid, config: any) {
    const conduit = (await this.get(id))!
    const channel = this.channelService.getById(conduit.channelId)
    const validConfig = await channel.schema.validateAsync(config)

    this.cacheById.del(id, true)
    this.cacheByProviderAndChannel.del(conduit.providerId, conduit.channelId, true)

    await this.query()
      .where({ id })
      .update({ initialized: null, config: this.cryptoService.encrypt(JSON.stringify(validConfig || {})) })

    await this.emitter.emit(ConduitEvents.Updated, id)
  }

  async updateInitialized(id: uuid) {
    const conduit = (await this.get(id))!
    this.cacheById.del(id, true)
    this.cacheByProviderAndChannel.del(conduit.providerId, conduit.channelId, true)

    await this.query()
      .where({ id })
      .update({ initialized: this.db.setDate(new Date()) })
  }

  async get(id: uuid): Promise<Conduit | undefined> {
    const cached = this.cacheById.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })

    if (rows?.length) {
      const conduit = this.deserialize(rows[0])
      this.cacheById.set(id, conduit)
      return conduit
    }

    return undefined
  }

  async getByProviderAndChannel(providerId: uuid, channelId: uuid) {
    const cached = this.cacheByProviderAndChannel.get(providerId, channelId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ providerId, channelId })

    if (rows?.length) {
      const conduit = this.deserialize(rows[0])
      this.cacheByProviderAndChannel.set(providerId, channelId, conduit)
      return conduit
    }

    return undefined
  }

  async listByProvider(providerId: uuid): Promise<Conduit[]> {
    const rows = await this.query().where({ providerId })
    return rows.map((x) => _.omit(x, 'config')) as Conduit[]
  }

  async listOutdated(tolerance: number, limit: number): Promise<Conduit[]> {
    const rows = await this.query()
      .select(['msg_conduits.id', 'providerId', 'channelId', 'initialized'])
      .where({ initiable: true })
      .andWhere((k) => {
        return k
          .where('initialized', '<=', this.db.setDate(new Date(Date.now() - tolerance))!)
          .orWhereNull('initialized')
      })
      .innerJoin('msg_channels', 'msg_channels.id', 'msg_conduits.channelId')
      .limit(limit)

    return rows as Conduit[]
  }

  async listByChannel(channelId: uuid): Promise<Conduit[]> {
    const rows = await this.query().where({ channelId })
    return rows.map((x) => _.omit(x, 'config')) as Conduit[]
  }

  private async onProviderDeleting({ providerId }: ProviderDeletingEvent) {
    const conduits = await this.listByProvider(providerId)

    for (const conduit of conduits) {
      await this.delete(conduit.id)
    }
  }

  private serialize(conduit: Partial<Conduit>) {
    return {
      ...conduit,
      initialized: this.db.setDate(conduit.initialized),
      config: this.cryptoService.encrypt(JSON.stringify(conduit.config || {}))
    }
  }

  private deserialize(conduit: any): Conduit {
    return {
      ...conduit,
      initialized: this.db.getDate(conduit.initialized),
      config: JSON.parse(this.cryptoService.decrypt(conduit.config))
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
