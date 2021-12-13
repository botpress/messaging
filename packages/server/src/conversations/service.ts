import { Conversation, ConversationWithLastMessage, uuid } from '@botpress/messaging-base'
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
  private cacheMostRecent!: ServerCache<uuid, Conversation>

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
    this.cacheMostRecent = await this.cachingService.newServerCache('cache_conversation_most_recent_by_user_id')

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

    const conversation = await this.get(id)

    this.cache.del(id, true)
    this.cacheMostRecent.del(conversation!.userId, true)

    return this.query().where({ id }).del()
  }

  public async get(id: uuid): Promise<Conversation | undefined> {
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

  public async getMostRecent(clientId: uuid, userId: uuid): Promise<Conversation | undefined> {
    // TODO: need to figure out batching for this

    const cached = this.cacheMostRecent.get(userId)
    if (cached) {
      return cached
    }

    const query = this.queryRecents(clientId, userId).limit(1)
    const rows = await query

    if (rows?.length) {
      const row = rows[0]
      const conversation = this.deserialize({
        id: row.id,
        clientId: row.clientId,
        userId: row.userId,
        createdOn: row.createdOn
      })

      this.cacheMostRecent.set(userId, conversation)

      return conversation
    }

    return undefined
  }

  public async listByUserId(
    clientId: uuid,
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ConversationWithLastMessage[]> {
    // TODO: need to figure out batching for this

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
        clientId: row.clientId,
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

  public invalidateMostRecent(userId: uuid) {
    this.cacheMostRecent.del(userId, true)
  }

  public async setMostRecent(userId: uuid, conversationId: uuid) {
    const currentMostRecent = this.cacheMostRecent.peek(userId)

    if (currentMostRecent?.id !== conversationId) {
      const conversation = await this.get(conversationId)
      this.cacheMostRecent.set(userId, conversation!)
    }
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
