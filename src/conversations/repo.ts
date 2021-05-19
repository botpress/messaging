import LRU from 'lru-cache'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'
import { ConversationTable } from './table'
import { Conversation, ConversationListFilters, RecentConversation } from './types'

export class ConversationRepo {
  private cache = new LRU<uuid, Conversation>({ max: 10000, maxAge: ms('5min') })
  private invalidateConvCache: (ids: uuid[]) => void = this._localInvalidateConvCache

  constructor(private db: DatabaseService, private table: ConversationTable) {}

  public async list(botId: string, filters: ConversationListFilters): Promise<RecentConversation[]> {
    const { userId, limit, offset } = filters

    let query = this.queryRecents(botId, userId)

    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.offset(offset)
    }

    return (await query).map((row: any) => {
      const conversation = this.deserialize(row)!
      // TODO
      // const message = row.messageId
      //  ? this.messageRepo.deserialize({ ...row, id: row.messageId, conversationId: row.id })
      //  : undefined

      return { ...conversation } //, lastMessage: message }
    })
  }

  public async deleteAll(botId: string, userId: string): Promise<number> {
    const deletedIds = (await this.query().select('id').where({ botId, userId })).map((x: any) => x.id)

    if (deletedIds.length) {
      await this.query().where({ botId, userId }).del()

      this.invalidateConvCache(deletedIds)
    }

    return deletedIds.length
  }

  public async create(botId: string, userId: uuid): Promise<Conversation> {
    const conversation = {
      id: uuidv4(),
      userId,
      botId,
      createdOn: new Date()
    }

    await this.query().insert(this.serialize(conversation))
    this.cache.set(conversation.id, conversation)

    return conversation
  }

  public async recent(botId: string, userId: string): Promise<Conversation | undefined> {
    let query = this.queryRecents(botId, userId)
    query = query.limit(1)

    return this.deserialize((await query)[0])
  }

  public async get(conversationId: uuid): Promise<Conversation | undefined> {
    if (conversationId === undefined) {
      return undefined
    }

    const cached = this.cache.get(conversationId)
    if (cached) {
      return cached
    }

    const rows = await this.query().select('*').where({ id: conversationId })

    const conversation = this.deserialize(rows[0])
    if (conversation) {
      this.cache.set(conversationId, conversation)
    }

    return conversation
  }

  public async delete(conversationId: uuid): Promise<boolean> {
    const numberOfDeletedRows = await this.query().where({ id: conversationId }).del()

    this.invalidateConvCache([conversationId])

    return numberOfDeletedRows > 0
  }

  private queryRecents(botId: string, userId: string) {
    return this.query()
      .select(
        'conversations.id',
        'conversations.userId',
        'conversations.botId',
        'conversations.createdOn',
        'messages.id as messageId',
        'messages.authorId',
        'messages.payload',
        'messages.sentOn'
      )
      .leftJoin('messages', 'messages.conversationId', 'conversations.id')
      .where({
        botId,
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

  private query() {
    return this.db.knex(this.table.id)
  }

  public serialize(conversation: Partial<Conversation>) {
    const { id, userId, botId, createdOn } = conversation
    return {
      id,
      userId,
      botId,
      createdOn: this.db.setDate(createdOn)
    }
  }

  public deserialize(conversation: any): Conversation | undefined {
    if (!conversation) {
      return undefined
    }

    const { id, userId, botId, createdOn } = conversation
    return {
      id,
      userId,
      botId,
      createdOn: this.db.getDate(createdOn)
    }
  }

  private _localInvalidateConvCache(ids: uuid[]) {
    ids?.forEach((id) => this.cache.del(id))
  }
}
