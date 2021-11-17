import { Message, uuid } from '@botpress/messaging-base'
import { Service } from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { ActionSource } from '../base/source'
import { Batcher } from '../batching/batcher'
import { BatchingService } from '../batching/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { ConversationService } from '../conversations/service'
import { DatabaseService } from '../database/service'
import { MessageEmitter, MessageEvents, MessageWatcher } from './events'
import { MessageTable } from './table'

export class MessageService extends Service {
  get events(): MessageWatcher {
    return this.emitter
  }

  private emitter: MessageEmitter
  private table: MessageTable
  private cache!: ServerCache<uuid, Message>
  private batcher!: Batcher<Message>

  constructor(
    private db: DatabaseService,
    private cachingService: CachingService,
    private batchingService: BatchingService,
    private conversationService: ConversationService
  ) {
    super()
    this.table = new MessageTable()
    this.emitter = new MessageEmitter()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_message_by_id')

    this.batcher = await this.batchingService.newBatcher(
      'batcher_messages',
      [this.conversationService.batcher],
      this.handleBatchFlush.bind(this)
    )

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: Message[]) {
    const rows = batch.map((x) => this.serialize(x))
    await this.query().insert(rows)
  }

  public async create(
    conversationId: uuid,
    authorId: uuid | undefined,
    payload: any,
    source?: ActionSource,
    forceId?: uuid
  ): Promise<Message> {
    const message = {
      id: forceId || uuidv4(),
      conversationId,
      authorId,
      sentOn: new Date(),
      payload
    }

    await this.batcher.push(message)
    const conversation = await this.conversationService.get(conversationId)
    await this.conversationService.setMostRecent(conversation!.userId, conversation!.id)

    await this.emitter.emit(MessageEvents.Created, { message, source })

    return message
  }

  public async delete(id: uuid): Promise<number> {
    await this.batcher.flush()

    const message = await this.get(id)
    const conversation = await this.conversationService.get(message!.conversationId)

    this.cache.del(id, true)
    this.conversationService.invalidateMostRecent(conversation!.userId)

    return this.query().where({ id }).del()
  }

  public async get(id: uuid): Promise<Message | undefined> {
    const cached = this.cache.get(id)
    if (cached) {
      return cached
    }

    await this.batcher.flush()

    const rows = await this.query().where({ id })
    if (rows?.length) {
      const message = this.deserialize(rows[0])

      this.cache.set(id, message)

      return message
    }

    return undefined
  }

  public async listByConversationId(conversationId: uuid, limit?: number, offset?: number): Promise<Message[]> {
    await this.batcher.flush()

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
    await this.batcher.flush()

    const deletedIds = (await this.query().select('id').where({ conversationId })).map((x) => x.id)

    if (deletedIds.length) {
      await this.query().where({ conversationId }).del()
      deletedIds.forEach((x) => this.cache.del(x, true))

      const conversation = await this.conversationService.get(conversationId)
      this.conversationService.invalidateMostRecent(conversation!.userId)
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
