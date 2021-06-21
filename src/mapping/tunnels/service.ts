import { v4 as uuidv4 } from 'uuid'
import { Service } from '../../base/service'
import { uuid } from '../../base/types'
import { DatabaseService } from '../../database/service'
import { TunnelTable } from './table'
import { Tunnel } from './types'

export class TunnelService extends Service {
  private table: TunnelTable

  constructor(private db: DatabaseService) {
    super()
    this.table = new TunnelTable()
  }

  async setup() {
    await this.db.registerTable(this.table)
  }

  async map(clientId: uuid, channelId: uuid): Promise<Tunnel> {
    const rows = await this.query().where({ clientId, channelId })

    if (rows?.length) {
      return rows[0]
    } else {
      const tunnel = {
        id: uuidv4(),
        clientId,
        channelId
      }

      await this.query().insert(tunnel)

      return tunnel
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
