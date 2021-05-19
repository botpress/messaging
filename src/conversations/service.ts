import LRU from 'lru-cache'
import ms from 'ms'
import { ScopeableService } from '../base/scopeable'
import { uuid } from '../base/types'
import { DatabaseService } from '../database/service'
import { ConversationRepo } from './repo'
import { ConversationTable } from './table'
import { Conversation, ConversationDeleteFilters, ConversationListFilters, RecentConversation } from './types'

export class ConversationService extends ScopeableService<ScopedConversationService> {
  private table: ConversationTable
  private repo: ConversationRepo

  constructor(private db: DatabaseService) {
    super()
    this.table = new ConversationTable()
    this.repo = new ConversationRepo(this.db, this.table)
  }

  async setup() {
    await this.db.table(this.table.id, this.table.create)
  }

  protected createScope(botId: string) {
    return new ScopedConversationService(botId, this.repo, <any>undefined)
  }
}

export class ScopedConversationService {
  private mostRecentCache: LRU<string, Conversation>

  constructor(
    private botId: string,
    private repo: ConversationRepo,
    public invalidateMostRecent: (userId: string, mostRecentConvoId?: uuid) => void
  ) {
    this.mostRecentCache = new LRU<string, Conversation>({ max: 10000, maxAge: ms('5min') })

    // TODO: distributed
    this.invalidateMostRecent = this.localInvalidateMostRecent
  }

  public async list(filters: ConversationListFilters): Promise<RecentConversation[]> {
    return this.repo.list(this.botId, filters)
  }

  public async delete(filters: ConversationDeleteFilters): Promise<number> {
    if (filters.id) {
      const conversation = (await this.repo.get(filters.id))!
      this.invalidateMostRecent(conversation.userId)

      return (await this.repo.delete(filters.id)) ? 1 : 0
    } else {
      this.invalidateMostRecent(filters.userId!)

      return this.repo.deleteAll(this.botId, filters.userId!)
    }
  }

  public async create(userId: uuid): Promise<Conversation> {
    return this.repo.create(this.botId, userId)
  }

  public async recent(userId: uuid): Promise<Conversation> {
    const cached = this.mostRecentCache.get(userId)
    if (cached) {
      return cached
    }

    let conversation = await this.repo.recent(this.botId, userId)
    if (!conversation) {
      conversation = await this.repo.create(this.botId, userId)
    }

    this.mostRecentCache.set(userId, conversation)

    return conversation
  }

  public async get(id: uuid): Promise<Conversation | undefined> {
    return this.repo.get(id)
  }

  public async setAsMostRecent(conversation: Conversation) {
    const currentMostRecent = this.mostRecentCache.peek(conversation.userId)

    if (currentMostRecent?.id !== conversation.id) {
      this.invalidateMostRecent(conversation.userId, conversation.id)
      this.mostRecentCache.set(conversation.userId, conversation)
    }
  }

  public localInvalidateMostRecent(userId: string, mostRecentConvoId?: uuid) {
    if (userId) {
      const cachedMostRecent = this.mostRecentCache.peek(userId)
      if (cachedMostRecent?.id !== mostRecentConvoId) {
        this.mostRecentCache.del(userId)
      }
    }
  }
}
