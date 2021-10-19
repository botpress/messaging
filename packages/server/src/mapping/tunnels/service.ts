import { uuid } from '@botpress/messaging-base'
import { DatabaseService, CachingService, ServerCache2D, ServerCache } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../../base/service'
import { TunnelTable } from './table'
import { Tunnel } from './types'

export class TunnelService extends Service {
  private table: TunnelTable
  private cacheById!: ServerCache<uuid, Tunnel>
  private cacheByClienAndChannel!: ServerCache2D<Tunnel>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()
    this.table = new TunnelTable()
  }

  async setup() {
    this.cacheById = await this.caching.newServerCache('cache_tunnel_by_id')
    this.cacheByClienAndChannel = await this.caching.newServerCache2D('cache_tunnel_by_client_and_channel')

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
    const cached = this.cacheByClienAndChannel.get(clientId, channelId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId, channelId })

    if (rows?.length) {
      const tunnel = rows[0] as Tunnel
      this.cacheByClienAndChannel.set(clientId, channelId, tunnel)
      return tunnel
    } else {
      const tunnel = {
        id: uuidv4(),
        clientId,
        channelId
      }

      await this.query().insert(tunnel)
      this.cacheByClienAndChannel.set(clientId, channelId, tunnel)
      this.cacheById.set(tunnel.id, tunnel)

      return tunnel
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
