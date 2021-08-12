import { uuid } from '@botpress/messaging-base'
import { v4 as uuidv4 } from 'uuid'
import { Service } from '../../base/service'
import { ServerCache2D } from '../../caching/cache2D'
import { CachingService } from '../../caching/service'
import { DatabaseService } from '../../database/service'
import { TunnelTable } from './table'
import { Tunnel } from './types'

export class TunnelService extends Service {
  private table: TunnelTable
  private cache!: ServerCache2D<Tunnel>

  constructor(private db: DatabaseService, private caching: CachingService) {
    super()
    this.table = new TunnelTable()
  }

  async setup() {
    this.cache = await this.caching.newServerCache2D('cache_tunnel_by_client_and_channel')

    await this.db.registerTable(this.table)
  }

  async map(clientId: uuid, channelId: uuid): Promise<Tunnel> {
    const cached = this.cache.get(clientId, channelId)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ clientId, channelId })

    if (rows?.length) {
      const tunnel = rows[0] as Tunnel
      this.cache.set(clientId, channelId, tunnel)
      return tunnel
    } else {
      const tunnel = {
        id: uuidv4(),
        clientId,
        channelId
      }

      await this.query().insert(tunnel)
      this.cache.set(clientId, channelId, tunnel)

      return tunnel
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
