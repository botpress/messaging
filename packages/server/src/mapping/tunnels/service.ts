import { uuid } from '@botpress/messaging-base'
import { CachingService, DatabaseService, ServerCache, ServerCache2D, Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { TunnelTable } from './table'
import { Tunnel } from './types'

export class TunnelService extends Service {
  private table: TunnelTable
  private cacheById!: ServerCache<uuid, Tunnel>
  private cacheByClientAndChannel!: ServerCache2D<Tunnel>
  private locks!: ServerCache2D<Promise<Tunnel>>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()
    this.table = new TunnelTable()
  }

  async setup() {
    this.cacheById = await this.caching.newServerCache('cache_tunnel_by_id')
    this.cacheByClientAndChannel = await this.caching.newServerCache2D('cache_tunnel_by_client_and_channel')
    this.locks = await this.caching.newServerCache2D('cache_tunnel_locks')

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
      let promise = this.locks.get(clientId, channelId)

      if (!promise) {
        promise = new Promise(async (resolve) => {
          const tunnel = {
            id: uuidv4(),
            clientId,
            channelId
          }

          await this.query().insert(tunnel)
          this.cacheByClientAndChannel.set(clientId, channelId, tunnel)
          this.cacheById.set(tunnel.id, tunnel)

          resolve(tunnel)
          this.locks.del(clientId, channelId)
        })

        this.locks.set(clientId, channelId, promise)
      }

      return promise
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
