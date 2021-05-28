import LRU from 'lru-cache'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { App } from '../app'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { Conduit as ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'
import { ProviderService } from '../providers/service'
import { ConduitTable } from './table'
import { Conduit } from './types'

export class ConduitService extends Service {
  private table: ConduitTable
  private cache: LRU<string, Conduit>
  private cacheByName!: LRU<string, ConduitInstance<any, any>>
  private cacheById!: LRU<uuid, ConduitInstance<any, any>>

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
    private channelService: ChannelService,
    private providerServie: ProviderService,
    private app: App
  ) {
    super()
    this.table = new ConduitTable()
    this.cache = new LRU({ maxAge: ms('5min'), max: 50000 })
    this.cacheByName = new LRU({ maxAge: ms('5min'), max: 50000 })
    this.cacheById = new LRU({ maxAge: ms('5min'), max: 50000 })
  }

  async setup() {
    await this.db.registerTable(this.table)

    for (const config of this.configService.current.providers) {
      const provider = (await this.providerServie.getByName(config.name))!

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
    return this.query().insert(this.serialize({ id: uuidv4(), providerId, channelId, config }))
  }

  async get(providerId: uuid, channelId: uuid): Promise<Conduit | undefined> {
    const key = this.getCacheKey(providerId, channelId)
    const cached = this.cache.get(key)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ providerId, channelId })
    if (rows?.length) {
      const conduit = this.deserialize(rows[0])
      this.cache.set(key, conduit)
      return conduit
    }

    return undefined
  }

  async getInstanceByProviderName(providerName: string, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheByName.get(this.getCacheKey(providerName, channelId))
    if (cached) {
      return cached
    }

    const provider = (await this.providerServie.getByName(providerName))!
    return this.getInstanceByProviderId(provider.id, channelId)
  }

  async getInstanceByProviderId(providerId: uuid, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheById.get(providerId)
    if (cached) {
      return cached
    }

    const provider = (await this.providerServie.getById(providerId))!
    const clientId = (await this.providerServie.getClientId(providerId))!
    const dbConduit = await this.get(provider.id, channelId)
    const channel = this.channelService.getById(channelId)
    const conduit = channel.createConduit()

    await conduit.setup(
      this.app,
      {
        ...dbConduit?.config,
        externalUrl: this.app.config.current.externalUrl
      },
      channel,
      provider.name,
      clientId
    )

    this.cacheById.set(this.getCacheKey(provider.id, channelId), conduit)
    this.cacheByName.set(this.getCacheKey(provider.name, channelId), conduit)

    return conduit
  }

  private getCacheKey(providerId: uuid, channelId: uuid) {
    return `${providerId}-${channelId}`
  }

  private serialize(conduit: Partial<Conduit>) {
    return {
      ...conduit,
      config: this.db.setJson(conduit.config)
    }
  }

  private deserialize(conduit: any): Conduit {
    return {
      ...conduit,
      config: this.db.getJson(conduit.config)
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
