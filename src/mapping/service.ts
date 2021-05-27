import LRUCache from 'lru-cache'
import ms from 'ms'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'

export class MappingService extends Service {
  private convCache: LRUCache<string, Mapping>
  private endpointCache: LRUCache<string, Mapping>

  constructor(private db: DatabaseService) {
    super()
    this.convCache = new LRUCache({ maxAge: ms('5min'), max: 50000 })
    this.endpointCache = new LRUCache({ maxAge: ms('5min'), max: 50000 })
  }

  async setup() {
    await this.db.table('mapping', (table) => {
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

    this.convCache.set(this.getConvCacheKey(mapping), mapping)
    this.endpointCache.set(this.getEndpointCacheKey(mapping), mapping)

    return mapping
  }

  async getByEndpoint(clientId: uuid, channelId: string, endpoint: Endpoint): Promise<Mapping> {
    const condition = {
      clientId,
      channelId,
      foreignAppId: endpoint.foreignAppId ?? null,
      foreignUserId: endpoint.foreignUserId ?? null,
      foreignConversationId: endpoint.foreignConversationId ?? null
    }

    const key = this.getEndpointCacheKey(<any>condition)
    const cached = this.endpointCache.get(key)
    if (cached) {
      return cached
    }

    const mapping = (await this.query().where(condition))[0] as Mapping
    this.endpointCache.set(key, mapping)

    return mapping
  }

  async getByConversationId(clientId: uuid, channelId: string, conversationId: uuid): Promise<Mapping> {
    const condition = {
      clientId,
      channelId,
      conversationId
    }

    const key = this.getConvCacheKey(condition)
    const cached = this.convCache.get(key)
    if (cached) {
      return cached
    }

    const mapping = (await this.query().where(condition))[0] as Mapping
    this.convCache.set(key, mapping)

    return mapping
  }

  private query() {
    return this.db.knex('mapping')
  }

  private getConvCacheKey(mapping: Partial<Mapping>) {
    return `${mapping.clientId}-${mapping.channelId}-${mapping.foreignAppId ?? '*'}-${mapping.foreignUserId ?? '*'}-${
      mapping.foreignConversationId ?? '*'
    }`
  }

  private getEndpointCacheKey(mapping: Partial<Mapping>) {
    return `${mapping.clientId}-${mapping.channelId}-${mapping.foreignAppId ?? '*'}-${mapping.foreignUserId ?? '*'}-${
      mapping.foreignConversationId ?? '*'
    }`
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
