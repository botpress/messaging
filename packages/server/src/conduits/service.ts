import { uuid } from '@botpress/messaging-base'
import {
  CachingService,
  CryptoService,
  DatabaseService,
  ServerCache,
  ServerCache2D,
  Service
} from '@botpress/messaging-engine'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
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
      config: validConfig
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
      .update({ config: this.cryptoService.encrypt(JSON.stringify(validConfig || {})) })

    // TODO: catch this event to but initialized at null
    await this.emitter.emit(ConduitEvents.Updated, id)
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
      config: this.cryptoService.encrypt(JSON.stringify(conduit.config || {}))
    }
  }

  private deserialize(conduit: any): Conduit {
    return {
      ...conduit,
      config: JSON.parse(this.cryptoService.decrypt(conduit.config))
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
