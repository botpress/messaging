import { Service } from '../base/service'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'

// TODO: caching
export class MappingService extends Service {
  constructor(private db: DatabaseService) {
    super()
  }

  async setup() {
    await this.db.table('mapping', (table) => {
      table.string('channel')
      table.string('foreignAppId').nullable()
      table.string('foreignUserId').nullable()
      table.string('foreignConversationId').nullable()
      table.uuid('conversationId').references('id').inTable('conversations')
      table.primary(['channel', 'conversationId'])
      table.index(['channel', 'foreignAppId', 'foreignUserId', 'foreignConversationId'])
    })
  }

  async create(channel: string, conversationId: uuid, endpoint: Endpoint): Promise<Mapping> {
    const mapping = {
      channel,
      foreignAppId: endpoint.foreignAppId,
      foreignUserId: endpoint.foreignUserId,
      foreignConversationId: endpoint.foreignConversationId,
      conversationId
    }

    await this.query().insert(mapping)

    return mapping
  }

  async delete(channel: string, conversationId: uuid): Promise<boolean> {
    const deletedRows = await this.query().where({ channel, conversationId }).del()

    // this.invalidateCache(local, foreign)

    return deletedRows > 0
  }

  async conversation(channel: string, endpoint: Endpoint): Promise<Mapping> {
    const rows = await this.query().where({
      channel,
      foreignAppId: endpoint.foreignAppId ?? null,
      foreignUserId: endpoint.foreignUserId ?? null,
      foreignConversationId: endpoint.foreignConversationId ?? null
    })

    return rows[0]
  }

  async endpoint(channel: string, conversationId: uuid): Promise<Mapping> {
    const rows = await this.query().where({
      channel,
      conversationId
    })

    return rows[0]
  }

  private query() {
    return this.db.knex('mapping')
  }
}

export type Mapping = {
  channel: string
  conversationId: string
} & Endpoint

export interface Endpoint {
  foreignAppId?: string
  foreignUserId?: string
  foreignConversationId?: string
}
