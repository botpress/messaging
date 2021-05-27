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
      // TODO: reference a channel table
      table.uuid('clientId').references('id').inTable('clients')
      table.uuid('channelId').references('id').inTable('channels')
      table.uuid('conversationId').references('id').inTable('conversations')
      table.string('foreignAppId').nullable()
      table.string('foreignUserId').nullable()
      table.string('foreignConversationId').nullable()
      table.primary(['clientId', 'channelId', 'conversationId'])
      table.index(['clientId', 'channelId', 'foreignAppId', 'foreignUserId', 'foreignConversationId'])
    })
  }

  async create(clientId: uuid, channelId: string, conversationId: uuid, endpoint: Endpoint): Promise<Mapping> {
    const mapping = {
      clientId,
      channelId,
      foreignAppId: endpoint.foreignAppId,
      foreignUserId: endpoint.foreignUserId,
      foreignConversationId: endpoint.foreignConversationId,
      conversationId
    }

    await this.query().insert(mapping)

    return mapping
  }

  async delete(clientId: uuid, channelId: string, conversationId: uuid): Promise<boolean> {
    const deletedRows = await this.query().where({ clientId, channelId, conversationId }).del()

    // this.invalidateCache(local, foreign)

    return deletedRows > 0
  }

  async conversation(clientId: uuid, channelId: string, endpoint: Endpoint): Promise<Mapping> {
    const rows = await this.query().where({
      clientId,
      channelId,
      foreignAppId: endpoint.foreignAppId ?? null,
      foreignUserId: endpoint.foreignUserId ?? null,
      foreignConversationId: endpoint.foreignConversationId ?? null
    })

    return rows[0]
  }

  async endpoint(clientId: uuid, channelId: string, conversationId: uuid): Promise<Mapping> {
    const rows = await this.query().where({
      clientId,
      channelId,
      conversationId
    })

    return rows[0]
  }

  private query() {
    return this.db.knex('mapping')
  }
}

export type Mapping = {
  clientId: uuid
  channelId: string
  conversationId: string
} & Endpoint

export interface Endpoint {
  foreignAppId?: string
  foreignUserId?: string
  foreignConversationId?: string
}
