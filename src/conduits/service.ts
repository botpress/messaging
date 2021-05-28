import LRU from 'lru-cache'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ChannelService } from '../channels/service'
import { ConfigService } from '../config/service'
import { DatabaseService } from '../database/service'
import { ProviderService } from '../providers/service'
import { ConduitTable } from './table'
import { Conduit } from './types'

export class ConduitService extends Service {
  private table: ConduitTable
  private cache: LRU<string, Conduit>

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
    private channelService: ChannelService,
    private providerServie: ProviderService
  ) {
    super()
    this.table = new ConduitTable()
    this.cache = new LRU({ maxAge: ms('5min'), max: 50000 })
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
