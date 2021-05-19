import LRU from 'lru-cache'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'
import { MessageTable } from './table'
import { Message, MessageListFilters } from './types'

export class MessageRepository {
  private cache = new LRU<uuid, Message>({ max: 10000, maxAge: ms('5min') })
  private invalidateMsgCache: (ids: uuid[]) => void = this._localInvalidateMsgCache

  constructor(private db: DatabaseService, private table: MessageTable) {}

  public async list(filters: MessageListFilters): Promise<Message[]> {
    const { conversationId, limit, offset } = filters

    let query = this.query().where({ conversationId }).orderBy('sentOn', 'desc')

    if (limit) {
      query = query.limit(limit)
    }

    if (offset) {
      query = query.offset(offset)
    }

    return (await query).map((x: any) => this.deserialize(x)!)
  }

  public async deleteAll(conversationId: uuid): Promise<number> {
    const deletedIds = (await this.query().select('id').where({ conversationId })).map((x) => x.id)

    if (deletedIds.length) {
      await this.query().where({ conversationId }).del()

      this.invalidateMsgCache(deletedIds)
    }

    return deletedIds.length
  }

  public async create(conversationId: uuid, payload: any, authorId: string | undefined): Promise<Message> {
    const message = {
      id: uuidv4(),
      conversationId,
      authorId,
      sentOn: new Date(),
      payload
    }

    await this.query().insert(this.serialize(message))
    this.cache.set(message.id, message)

    return message
  }

  public async get(messageId: uuid): Promise<Message | undefined> {
    if (messageId === undefined) {
      return undefined
    }

    const cached = this.cache.get(messageId)
    if (cached) {
      return cached
    }

    const rows = await this.query().select('*').where({ id: messageId })

    const message = this.deserialize(rows[0])
    if (message) {
      this.cache.set(messageId, message)
    }

    return message
  }

  public async delete(messageId: uuid): Promise<boolean> {
    const numberOfDeletedRows = await this.query().where({ id: messageId }).del()

    this.invalidateMsgCache([messageId])

    return numberOfDeletedRows > 0
  }

  private query() {
    return this.db.knex(this.table.id)
  }

  public serialize(message: Partial<Message>) {
    const { id, conversationId, authorId, sentOn, payload } = message
    return {
      id,
      conversationId,
      authorId,
      sentOn: this.db.setDate(sentOn),
      payload: this.db.setJson(payload)
    }
  }

  public deserialize(message: any): Message | undefined {
    if (!message) {
      return undefined
    }

    const { id, conversationId, authorId, sentOn, payload } = message
    return {
      id,
      conversationId,
      authorId,
      sentOn: this.db.getDate(sentOn),
      payload: this.db.getJson(payload)
    }
  }

  private _localInvalidateMsgCache(ids: uuid[]) {
    ids?.forEach((id) => this.cache.del(id))
  }
}
