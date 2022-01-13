import { Conversation, uuid } from '@botpress/messaging-base'
import {
  Batcher,
  BatchingService,
  CachingService,
  DatabaseService,
  ServerCache,
  Service
} from '@botpress/messaging-engine'
import { v4 as uuidv4 } from 'uuid'
import { UserService } from '../users/service'
import { ConversationEmitter, ConversationEvents, ConversationWatcher } from './events'
import { ConversationTable } from './table'

export class ConversationService extends Service {
  get events(): ConversationWatcher {
    return this.emitter
  }

  public batcher!: Batcher<Conversation>

  private emitter: ConversationEmitter
  private table: ConversationTable
  private cache!: ServerCache<uuid, Conversation>

  constructor(
    private db: DatabaseService,
    private cachingService: CachingService,
    private batchingService: BatchingService,
    private userService: UserService
  ) {
    super()
    this.table = new ConversationTable()
    this.emitter = new ConversationEmitter()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_conversation_by_id')

    this.batcher = await this.batchingService.newBatcher(
      'batcher_conversations',
      [this.userService.batcher],
      this.handleBatchFlush.bind(this)
    )

    await this.db.registerTable(this.table)
  }

  private async handleBatchFlush(batch: Conversation[]) {
    const rows = batch.map((x) => this.serialize(x))
    await this.query().insert(rows)
  }

  public async create(clientId: uuid, userId: uuid): Promise<Conversation> {
    const conversation = {
      id: uuidv4(),
      userId,
      clientId,
      createdOn: new Date()
    }

    await this.batcher.push(conversation)
    this.cache.set(conversation.id, conversation)
    await this.emitter.emit(ConversationEvents.Created, { conversation })

    return conversation
  }

  public async start(id: uuid): Promise<void> {
    await this.emitter.emit(ConversationEvents.Started, { conversationId: id })
  }

  public async delete(id: uuid): Promise<number> {
    await this.batcher.flush()
    this.cache.del(id, true)
    return this.query().where({ id }).del()
  }

  public async fetch(id: uuid): Promise<Conversation | undefined> {
    const cached = this.cache.get(id)
    if (cached) {
      return cached
    }

    await this.batcher.flush()

    const rows = await this.query().where({ id })
    if (rows?.length) {
      const conversation = this.deserialize(rows[0])

      this.cache.set(id, conversation)

      return conversation
    }

    return undefined
  }

  public async get(id: uuid): Promise<Conversation> {
    const val = await this.fetch(id)
    if (!val) {
      throw new Error(`Conversation ${id} not found`)
    }
    return val
  }

  public async listByUserId(clientId: uuid, userId: string, limit?: number, offset?: number): Promise<Conversation[]> {
    let query = this.queryRecents(clientId, userId)

    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.offset(offset)
    }

    const rows = await query

    return rows.map((x) =>
      this.deserialize({
        id: x.id,
        clientId: x.clientId,
        userId: x.userId,
        createdOn: x.createdOn
      })
    )
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
      .orderBy('createdOn', 'desc')
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
