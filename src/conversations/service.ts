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
    this.cache.del(id, true)
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

  public async getMostRecent(clientId: uuid, userId: uuid): Promise<Conversation | undefined> {
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

      const message = row.messageId
        ? {
            id: row.messageId,
            conversationId: conversation.id,
            authorId: row.authorId,
            sentOn: this.db.getDate(row.sentOn),
            payload: this.db.getJson(row.payload)
          }
        : undefined

      return { ...conversation, lastMessage: message }
    })
  }

  private queryRecents(clientId: string, userId: string) {
    return this.query()
      .select(
        'msg_conversations.id',
        'msg_conversations.userId',
        'msg_conversations.clientId',
        'msg_conversations.createdOn',
        'msg_messages.id as messageId',
        'msg_messages.authorId',
        'msg_messages.payload',
        'msg_messages.sentOn'
      )
      .leftJoin('msg_messages', 'msg_messages.conversationId', 'msg_conversations.id')
      .where({
        clientId,
        userId
      })
      .andWhere((builder: any) => {
        void builder
          .where({
            sentOn: this.db.knex
              .max('sentOn')
              .from('msg_messages')
              .where('msg_messages.conversationId', this.db.knex.ref('msg_conversations.id'))
          })
          .orWhereNull('sentOn')
      })
      .groupBy('msg_conversations.id', 'msg_messages.id')
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
