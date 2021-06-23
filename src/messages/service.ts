import { v4 as uuidv4 } from 'uuid'
import { Service } from '../base/service'
import { uuid } from '../base/types'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConversationService } from '../conversations/service'
import { DatabaseService } from '../database/service'
import { MessageTable } from './table'
import { Message } from './types'

export class MessageService extends Service {
  private table: MessageTable
  private cache!: ServerCache<uuid, Message>

  constructor(
    private db: DatabaseService,
    private cachingService: CachingService,
    private conversationService: ConversationService
  ) {
    super()
    this.table = new MessageTable()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_message_by_id')

    await this.db.registerTable(this.table)
  }

  public async create(conversationId: uuid, payload: any, authorId?: uuid): Promise<Message> {
    const message = {
      id: uuidv4(),
      conversationId,
      authorId,
      sentOn: new Date(),
      payload
    }

    await this.query().insert(this.serialize(message))

    return message
  }

  public async delete(id: uuid): Promise<number> {
    this.cache.del(id)
    return this.query().where({ id }).del()
  }

  public async get(id: uuid): Promise<Message | undefined> {
    const cached = this.cache.get(id)
    if (cached) {
      return cached
    }

    const rows = await this.query().where({ name })
    if (rows?.length) {
      const message = this.deserialize(rows[0])

      this.cache.set(id, message)

      return message
    }

    return undefined
  }

  public async listByConversationId(conversationId: uuid, limit?: number, offset?: number): Promise<Message[]> {
    let query = this.query().where({ conversationId }).orderBy('sentOn', 'desc')

    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.offset(offset)
    }

    const rows = await query
    return rows.map((x: any) => this.deserialize(x)!)
  }

  public async deleteByConversationId(conversationId: uuid): Promise<number> {
    const deletedIds = (await this.query().select('id').where({ conversationId })).map((x) => x.id)

    if (deletedIds.length) {
      await this.query().where({ conversationId }).del()
      deletedIds.forEach((x) => this.cache.del(x))
    }

    return deletedIds.length
  }

  public serialize(message: Partial<Message>) {
    return {
      ...message,
      sentOn: this.db.setDate(message.sentOn),
      payload: this.db.setJson(message.payload)
    }
  }

  public deserialize(message: any): Message {
    return {
      ...message,
      sentOn: this.db.getDate(message.sentOn),
      payload: this.db.getJson(message.payload)
    }
  }

  private query() {
    return this.db.knex(this.table.id)
  }
}
