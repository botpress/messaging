import { v4 as uuidv4 } from 'uuid'
import { App } from '../app'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { Conduit as ConduitInstance } from '../channels/base/conduit'
import { ChannelService } from '../channels/service'
import { ClientService } from '../clients/service'
import { ConfigService } from '../config/service'
import { CryptoService } from '../crypto/service'
import { DatabaseService } from '../database/service'
import { ProviderService } from '../providers/service'
import { ConduitTable } from './table'
import { Conduit } from './types'

export class ConduitService extends Service {
  private table: ConduitTable
  private cache!: ServerCache<string, Conduit>
  private cacheByName!: ServerCache<string, ConduitInstance<any, any>>
  private cacheById!: ServerCache<uuid, ConduitInstance<any, any>>

  constructor(
    private db: DatabaseService,
    private cryptoService: CryptoService,
    private configService: ConfigService,
    private cachingService: CachingService,
    private channelService: ChannelService,
    private providerService: ProviderService,
    private clientService: ClientService,
    private app: App
  ) {
    super()
    this.table = new ConduitTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_conduit_by_id')
    this.cacheByName = await this.cachingService.newServerCache('cache_conduit_by_provider_name')
    this.cacheById = await this.cachingService.newServerCache('cache_conduit_by_provider_id')

    await this.db.registerTable(this.table)

    for (const config of this.configService.current.providers) {
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

  async updateConfig(providerId: uuid, channelId: uuid, config: any) {
    const provider = (await this.providerService.getById(providerId))!

    this.cache.del(this.getCacheKey(providerId, channelId))
    this.cacheById.del(this.getCacheKey(providerId, channelId))
    this.cacheByName.del(this.getCacheKey(provider.name, channelId))

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

  async getInstanceByProviderName(providerName: string, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheByName.get(this.getCacheKey(providerName, channelId))
    if (cached) {
      return cached
    }

    const provider = (await this.providerService.getByName(providerName))!
    return this.getInstanceByProviderId(provider.id, channelId)
  }

  async getInstanceByProviderId(providerId: uuid, channelId: uuid): Promise<ConduitInstance<any, any>> {
    const cached = this.cacheById.get(providerId)
    if (cached) {
      return cached
    }

    const provider = (await this.providerService.getById(providerId))!
    const client = (await this.clientService.getByProviderId(providerId))!
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
      client.id
    )

    this.cacheById.set(this.getCacheKey(provider.id, channelId), conduit)
    this.cacheByName.set(this.getCacheKey(provider.name, channelId), conduit)

    return conduit
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
