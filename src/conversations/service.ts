import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { DatabaseService } from '../database/service'
import { ConversationTable } from './table'
import { Conversation, RecentConversation } from './types'

export class ConversationService extends Service {
  private table: ConversationTable
  private cache!: ServerCache<uuid, Conversation>

  constructor(private db: DatabaseService, private cachingService: CachingService) {
    super()
    this.table = new ConversationTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_conversation_by_id')

    await this.db.registerTable(this.table)
  }

  public async create(clientId: uuid, userId: uuid): Promise<Conversation> {
    const conversation = {
      id: uuidv4(),
      userId,
      clientId,
      createdOn: new Date()
    }

    await this.query().insert(this.serialize(conversation))

    return conversation
  }

  public async delete(id: uuid): Promise<number> {
    this.cache.del(id)
    return this.query().where({ id }).del()
  }

  public async get(id: uuid): Promise<Conversation | undefined> {
    const cached = this.cache.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ id })
    if (rows?.length) {
      const conversation = this.deserialize(rows[0])

      this.cache.set(id, conversation)

      return conversation
    }

    return undefined
  }

  public async getMostRecent(clientId: uuid, userId: string): Promise<Conversation | undefined> {
    // TODO: cache

    const query = this.queryRecents(clientId, userId).limit(1)
    const rows = await query

    if (rows?.length) {
      const row = rows[0]
      const conversation = this.deserialize({
        id: row.id,
        client: row.clientId,
        userId: row.userId,
        createdOn: row.createdOn
      })

      return conversation
    }

    return undefined
  }

  public async listByUserId(
    clientId: uuid,
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<RecentConversation[]> {
    let query = this.queryRecents(clientId, userId)

    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.offset(offset)
    }

    return (await query).map((row: any) => {
      const conversation = this.deserialize({
        id: row.id,
        client: row.clientId,
        userId: row.userId,
        createdOn: row.createdOn
      })

      const message = {
        id: row.messageId,
        conversationId: conversation.id,
        authorId: row.authorId,
        sentOn: this.db.getDate(row.sentOn),
        payload: this.db.getJson(row.payload)
      }

      return { ...conversation, lastMessage: message }
    })
  }

  private queryRecents(clientId: string, userId: string) {
    return this.query()
      .select(
        'conversations.id',
        'conversations.userId',
        'conversations.clientId',
        'conversations.createdOn',
        'messages.id as messageId',
        'messages.authorId',
        'messages.payload',
        'messages.sentOn'
      )
      .leftJoin('messages', 'messages.conversationId', 'conversations.id')
      .where({
        clientId,
        userId
      })
      .andWhere((builder: any) => {
        void builder
          .where({
            sentOn: this.db.knex
              .max('sentOn')
              .from('messages')
              .where('messages.conversationId', this.db.knex.ref('conversations.id'))
          })
          .orWhereNull('sentOn')
      })
      .groupBy('conversations.id', 'messages.id')
      .orderBy('sentOn', 'desc')
  }

  private serialize(conversation: Partial<Conversation>) {
    return {
      ...conversation,
      createdOn: this.db.setDate(conversation.createdOn)
    }
  }

  private deserialize(conversation: any): Conversation {
    return {
      ...conversation,
      createdOn: this.db.getDate(conversation.createdOn)
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
