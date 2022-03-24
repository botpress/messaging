import { uuid } from '@botpress/messaging-base'
import {
  Barrier2D,
  BarrierService,
  CachingService,
  DatabaseService,
  ServerCache,
  ServerCache2D,
  Service
} from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { TunnelTable } from './table'
import { Tunnel } from './types'

export class TunnelService extends Service {
  private table: TunnelTable
  private cacheById!: ServerCache<uuid, Tunnel>
  private cacheByClientAndChannel!: ServerCache2D<Tunnel>
  private cacheByClientAndCustomChannel!: ServerCache2D<Tunnel>
  private barrier!: Barrier2D<Tunnel>

  constructor(private db: DatabaseService, private caching: CachingService, private barriers: BarrierService) {
    super()
    this.table = new TunnelTable()
  }

  async setup() {
    this.cacheById = await this.caching.newServerCache('cache_tunnel_by_id')
    this.cacheByClientAndChannel = await this.caching.newServerCache2D('cache_tunnel_by_client_and_channel')
    this.cacheByClientAndCustomChannel = await this.caching.newServerCache2D(
      'cache_tunnel_by_client_and_custom_channel'
    )
    this.barrier = await this.barriers.newBarrier2D('barrier_tunnel')

    await this.db.registerTable(this.table)
  }

  async get(tunnelId: uuid): Promise<Tunnel | undefined> {
    const cached = this.cacheById.get(tunnelId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id: tunnelId })

    if (rows?.length) {
      const tunnel = rows[0] as Tunnel
      this.cacheById.set(tunnelId, tunnel)
      return tunnel
    } else {
      return undefined
    }
  }

  async map(clientId: uuid, channelId: uuid): Promise<Tunnel> {
    const tunnel = await this.getByClientAndChannelId(clientId, channelId)
    if (tunnel) {
      return tunnel
    }

    return this.barrier.once(clientId, channelId, async () => {
      return this.create(clientId, channelId, undefined)
    })
  }

  async mapCustom(clientId: uuid, customChannelName: string): Promise<Tunnel> {
    const tunnel = await this.getByClientAndCustomChannel(clientId, customChannelName)
    if (tunnel) {
      return tunnel
    }

    return this.barrier.once(clientId, customChannelName, async () => {
      return this.create(clientId, undefined, customChannelName)
    })
  }

  private async create(
    clientId: uuid,
    channelId: uuid | undefined,
    customChannelName: string | undefined
  ): Promise<Tunnel> {
    const tunnel = {
      id: uuidv4(),
      clientId,
      channelId,
      customChannelName
    }

    await this.query().insert(tunnel)

    if (channelId) {
      this.cacheByClientAndChannel.set(clientId, channelId, tunnel)
    }
    if (customChannelName) {
      this.cacheByClientAndCustomChannel.set(clientId, customChannelName, tunnel)
    }

    this.cacheById.set(tunnel.id, tunnel)

    return tunnel
  }

  private async getByClientAndChannelId(clientId: uuid, channelId: uuid): Promise<Tunnel | undefined> {
    const cached = this.cacheByClientAndChannel.get(clientId, channelId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId, channelId })

    if (rows?.length) {
      const tunnel = rows[0] as Tunnel
      this.cacheByClientAndChannel.set(clientId, channelId, tunnel)
      return tunnel
    } else {
      return undefined
    }
  }

  private async getByClientAndCustomChannel(clientId: uuid, customChannelName: string): Promise<Tunnel | undefined> {
    const cached = this.cacheByClientAndCustomChannel.get(clientId, customChannelName)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId, customChannelName })

    if (rows?.length) {
      const tunnel = rows[0] as Tunnel
      this.cacheByClientAndCustomChannel.set(clientId, customChannelName, tunnel)
      return tunnel
    } else {
      return undefined
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
